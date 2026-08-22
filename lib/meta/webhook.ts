import { createHmac, timingSafeEqual } from "crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  // Instagram-Login apps sign webhooks with the Instagram app secret, while
  // Facebook-Login apps use the Facebook app secret. Both belong to the same
  // app, so accept a signature that matches either — this avoids a config
  // guess about which key Meta uses for a given app type.
  const secrets = [
    process.env.FACEBOOK_APP_SECRET,
    process.env.INSTAGRAM_APP_SECRET,
  ].filter((s): s is string => Boolean(s));

  if (secrets.length === 0) {
    throw new Error(
      "FACEBOOK_APP_SECRET or INSTAGRAM_APP_SECRET is required to verify webhooks"
    );
  }

  return secrets.some((secret) => {
    const expected =
      "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export interface WebhookCommentEvent {
  instagramAccountId: string;
  commentId: string;
  commentText: string;
  commenterId: string;
  commenterName?: string;
  mediaId: string;
}

export interface WebhookFacebookCommentEvent {
  pageId: string;
  commentId: string;
  commentText: string;
  commenterId: string;
  commenterName?: string;
  postId: string;
}

export interface WebhookFacebookMessageEvent {
  pageId: string;
  messageId: string;
  messageText: string;
  senderId: string;
}

interface WebhookEntry {
  id: string;
  time: number;
  changes?: Array<{
    field: string;
    value: {
      id?: string;
      comment_id?: string;
      text?: string;
      from?: {
        id?: string;
        username?: string;
        name?: string;
      };
      media?: {
        id?: string;
      };
      media_id?: string;
      // Facebook Page "feed" change shape (comments field name/payload differ
      // from Instagram's "comments" field — NOT verified against a real
      // webhook yet, see parseFacebookCommentEvents below).
      item?: string;
      verb?: string;
      comment_id_alt?: string;
      post_id?: string;
      message?: string;
    };
  }>;
  messaging?: Array<{
    sender?: { id?: string };
    recipient?: { id?: string };
    postback?: { mid?: string; title?: string; payload?: string };
    read?: { watermark?: number; seq?: number };
    message?: {
      mid?: string;
      text?: string;
      is_echo?: boolean;
      is_deleted?: boolean;
      is_unsupported?: boolean;
      attachments?: Array<{ type?: string }>;
    };
  }>;
}

export interface WebhookMessageEvent {
  instagramAccountId: string;
  messageId: string;
  messageText: string;
  senderId: string;
}

export interface WebhookPostbackEvent {
  instagramAccountId: string;
  userId: string;
  payload: string;
  mid?: string;
}

export interface WebhookReadEvent {
  instagramAccountId: string;
  userId: string;
  watermark?: number;
}

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export function parseCommentEvents(payload: WebhookPayload): WebhookCommentEvent[] {
  const events: WebhookCommentEvent[] = [];

  if (payload.object !== "instagram") {
    return events;
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "comments") continue;

      const value = change.value;
      const commentId = value?.id ?? value?.comment_id;
      const mediaId = value?.media?.id ?? value?.media_id;
      const commenterId = value?.from?.id;

      if (!entry.id || !commentId || !mediaId || !commenterId) {
        continue;
      }

      // Skip the connected account's own comments and comment replies.
      // A private reply to yourself is rejected by Meta, so queueing one
      // only produces a failed log and wasted retries.
      if (commenterId === entry.id) {
        continue;
      }

      events.push({
        instagramAccountId: entry.id,
        commentId,
        commentText: value.text ?? "",
        commenterId,
        commenterName: value.from?.username,
        mediaId,
      });
    }
  }

  return events;
}

/**
 * Parse button-tap postbacks (from an opening DM's button) out of a webhook
 * payload. Each event carries the tapping user's IGSID and our postback payload.
 */
export function parsePostbackEvents(
  payload: WebhookPayload
): WebhookPostbackEvent[] {
  const events: WebhookPostbackEvent[] = [];

  if (payload.object !== "instagram") return events;

  for (const entry of payload.entry ?? []) {
    for (const messaging of entry.messaging ?? []) {
      const postbackPayload = messaging.postback?.payload;
      const userId = messaging.sender?.id;
      const accountId = entry.id ?? messaging.recipient?.id;

      if (!postbackPayload || !userId || !accountId) continue;
      // Ignore echoes of the account's own actions.
      if (userId === accountId) continue;

      events.push({
        instagramAccountId: accountId,
        userId,
        payload: postbackPayload,
        mid: messaging.postback?.mid,
      });
    }
  }

  return events;
}

/**
 * Parse inbound Instagram DMs out of a webhook payload. These drive the
 * keyword-triggered autoreply: a user messages the account, and a campaign
 * with `dmTriggerEnabled` whose keywords match the text replies to them.
 *
 * Echoes (messages the account itself sent, including our own autoreplies),
 * deletions, and attachment-only messages with no text are dropped here so
 * the worker never sees them — an echo would otherwise let an autoreply
 * containing its own keyword trigger itself.
 */
export function parseMessageEvents(
  payload: WebhookPayload
): WebhookMessageEvent[] {
  const events: WebhookMessageEvent[] = [];

  if (payload.object !== "instagram") return events;

  for (const entry of payload.entry ?? []) {
    for (const messaging of entry.messaging ?? []) {
      const message = messaging.message;
      if (!message) continue;
      if (message.is_echo || message.is_deleted || message.is_unsupported) {
        continue;
      }

      const text = message.text?.trim();
      const messageId = message.mid;
      const senderId = messaging.sender?.id;
      const accountId = entry.id ?? messaging.recipient?.id;

      if (!text || !messageId || !senderId || !accountId) continue;
      // Ignore anything the connected account sent to itself.
      if (senderId === accountId) continue;

      events.push({
        instagramAccountId: accountId,
        messageId,
        messageText: text,
        senderId,
      });
    }
  }

  return events;
}

/**
 * Parse Instagram DM read receipts. When a user reads an opening DM but does
 * not tap its button, the webhook route uses this to schedule the reveal after
 * a short grace period.
 */
export function parseReadEvents(payload: WebhookPayload): WebhookReadEvent[] {
  const events: WebhookReadEvent[] = [];

  if (payload.object !== "instagram") return events;

  for (const entry of payload.entry ?? []) {
    for (const messaging of entry.messaging ?? []) {
      if (!messaging.read) continue;

      const userId = messaging.sender?.id;
      const accountId = entry.id ?? messaging.recipient?.id;

      if (!userId || !accountId) continue;
      if (userId === accountId) continue;

      events.push({
        instagramAccountId: accountId,
        userId,
        watermark: messaging.read.watermark,
      });
    }
  }

  return events;
}

// ─── Facebook Page (comments + Messenger) ──────────────────────────────────
//
// Deliberately separate from the Instagram parsers above, not unified — the
// two platforms' webhook payload shapes differ enough (see the "feed" vs
// "comments" field name below) that a shared parser would need
// channel-conditional branching internally anyway. Same duplicate-then-adapt
// call as lib/meta/client.ts's Facebook send functions.

/**
 * Parse Facebook Page comment events out of a webhook payload.
 *
 * NOT VERIFIED against a real webhook yet. Meta's documented shape for a
 * Page's comment webhook is the "feed" field with `value.item === "comment"`
 * and `value.verb === "add"` — a different field name and shape than
 * Instagram's dedicated "comments" field. Confirm this against a real
 * comment on a connected Page before trusting it in production (same
 * discipline as the Facebook comment-reply endpoint in lib/meta/client.ts —
 * don't assume the docs, check a live event).
 */
export function parseFacebookCommentEvents(
  payload: WebhookPayload
): WebhookFacebookCommentEvent[] {
  const events: WebhookFacebookCommentEvent[] = [];

  if (payload.object !== "page") return events;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "feed") continue;

      const value = change.value;
      if (value.item !== "comment" || value.verb !== "add") continue;

      const commentId = value.comment_id ?? value.id;
      const postId = value.post_id ?? value.media_id;
      const commenterId = value.from?.id;

      if (!entry.id || !commentId || !postId || !commenterId) continue;
      // Skip the Page's own comments (staff replying manually) — same guard
      // as parseCommentEvents for Instagram.
      if (commenterId === entry.id) continue;

      events.push({
        pageId: entry.id,
        commentId,
        commentText: value.message ?? value.text ?? "",
        commenterId,
        commenterName: value.from?.name,
        postId,
      });
    }
  }

  return events;
}

/**
 * Parse inbound Facebook Messenger DMs out of a webhook payload. The
 * `entry[].messaging[]` shape is the Messenger Platform format — the same
 * schema Instagram DMs already reuse (see parseMessageEvents above), so this
 * mirrors it directly rather than guessing at a different shape.
 */
export function parseFacebookMessageEvents(
  payload: WebhookPayload
): WebhookFacebookMessageEvent[] {
  const events: WebhookFacebookMessageEvent[] = [];

  if (payload.object !== "page") return events;

  for (const entry of payload.entry ?? []) {
    for (const messaging of entry.messaging ?? []) {
      const message = messaging.message;
      if (!message) continue;
      if (message.is_echo || message.is_deleted || message.is_unsupported) {
        continue;
      }

      const text = message.text?.trim();
      const messageId = message.mid;
      const senderId = messaging.sender?.id;
      const pageId = entry.id ?? messaging.recipient?.id;

      if (!text || !messageId || !senderId || !pageId) continue;
      if (senderId === pageId) continue;

      events.push({
        pageId,
        messageId,
        messageText: text,
        senderId,
      });
    }
  }

  return events;
}
