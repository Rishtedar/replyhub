import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { getEncryptionKeyHex, getMetaGraphApiVersion, requireEnv } from "@/lib/env";

const INSTAGRAM_OAUTH_URL = "https://api.instagram.com/oauth/authorize";
const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
// Facebook Login for Business uses the general graph.facebook.com OAuth
// endpoints (distinct from Instagram's api.instagram.com ones above) — see
// getMetaGraphApiVersion() in lib/env.ts for the API version.
function facebookOAuthUrl(): string {
  return `https://www.facebook.com/${getMetaGraphApiVersion()}/dialog/oauth`;
}
function facebookTokenUrl(): string {
  return `https://graph.facebook.com/${getMetaGraphApiVersion()}/oauth/access_token`;
}
function facebookGraphUrl(path: string): string {
  return `https://graph.facebook.com/${getMetaGraphApiVersion()}${path}`;
}
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

interface OAuthStatePayload {
  workspaceId: string;
  ts: number;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signState(payload: string): string {
  return createHmac("sha256", requireEnv("NEXTAUTH_SECRET"))
    .update(payload)
    .digest("base64url");
}

export function createOAuthState(workspaceId: string): string {
  const payload = base64UrlEncode(
    JSON.stringify({ workspaceId, ts: Date.now() } satisfies OAuthStatePayload)
  );
  return `${payload}.${signState(payload)}`;
}

export function verifyOAuthState(state: string | null): OAuthStatePayload | null {
  if (!state) return null;

  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;

  const expected = signState(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as OAuthStatePayload;
    if (!parsed.workspaceId || Date.now() - parsed.ts > STATE_MAX_AGE_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getAuthorizationUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("INSTAGRAM_APP_ID"),
    redirect_uri: redirectUri,
    scope:
      "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_manage_insights",
    response_type: "code",
    state,
  });

  return `${INSTAGRAM_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; userId: string }> {
  const body = new URLSearchParams({
    client_id: requireEnv("INSTAGRAM_APP_ID"),
    client_secret: requireEnv("INSTAGRAM_APP_SECRET"),
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(INSTAGRAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Token exchange failed: ${error.error_message || JSON.stringify(error)}`
    );
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    userId: String(data.user_id),
  };
}

function getEncryptionKey(): Buffer {
  return Buffer.from(getEncryptionKeyHex(), "hex");
}

export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString("base64");
}

export function decryptToken(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, "base64");

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8"
  );
}

// ─── Facebook Page OAuth (Facebook Login for Business) ─────────────────────
//
// Structurally different from the Instagram flow above, not just a
// find-and-replace of the URL: Facebook Login returns a USER access token
// with access to every Page that user manages, not one account directly.
// getFacebookPages() below does the follow-up call every integration needs
// (GET /me/accounts) to turn that into actual Page-scoped tokens.

export function getFacebookAuthorizationUrl(
  redirectUri: string,
  state: string
): string {
  // Uses a Business Login configuration (config_id) instead of a plain
  // `scope` param. This isn't cosmetic: for a Page that lives inside a
  // Meta Business Portfolio (as opposed to one a person administers
  // directly via the legacy per-Page role system), the classic
  // client_id+scope OAuth dialog silently returns zero Pages from
  // /me/accounts even when the person has full access via the portfolio —
  // confirmed against a real Business-owned Page (same failure mode
  // already known from the Zavu integration, see
  // memory/social_autoreply_project.md). The config_id flow instead shows
  // Meta's own asset picker, so the person explicitly grants the specific
  // Page(s) — that grant is what makes them show up afterward. The
  // permission set (pages_show_list/pages_messaging/pages_manage_metadata/
  // pages_read_engagement — the same four scopes as before, still
  // deliberately without pages_manage_posts) lives on the config itself in
  // the Meta App dashboard, not in this URL — `scope` is dropped on
  // purpose when config_id is present.
  const params = new URLSearchParams({
    client_id: requireEnv("FACEBOOK_APP_ID"),
    redirect_uri: redirectUri,
    config_id: requireEnv("FACEBOOK_LOGIN_CONFIG_ID"),
    response_type: "code",
    state,
  });

  return `${facebookOAuthUrl()}?${params.toString()}`;
}

export async function exchangeFacebookCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string }> {
  const params = new URLSearchParams({
    client_id: requireEnv("FACEBOOK_APP_ID"),
    client_secret: requireEnv("FACEBOOK_APP_SECRET"),
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(`${facebookTokenUrl()}?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Facebook token exchange failed: ${error.error?.message ?? JSON.stringify(error)}`
    );
  }

  const data = await response.json();
  return { accessToken: data.access_token };
}

/**
 * Exchange a short-lived user token for a long-lived one (~60 days). Unlike
 * Instagram's dedicated exchange endpoint, this reuses the same OAuth token
 * endpoint with grant_type=fb_exchange_token.
 */
export async function getLongLivedFacebookUserToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: requireEnv("FACEBOOK_APP_ID"),
    client_secret: requireEnv("FACEBOOK_APP_SECRET"),
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(`${facebookTokenUrl()}?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Facebook long-lived token exchange failed: ${error.error?.message ?? JSON.stringify(error)}`
    );
  }

  const data = await response.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in ?? 5184000 };
}

export interface FacebookManagedPage {
  id: string;
  name: string;
  access_token: string;
}

/**
 * List the Pages the authorizing user manages, each with its own
 * already-long-lived Page access token (a Page token derived from a
 * long-lived user token doesn't expire on its own — no separate refresh flow
 * needed, unlike Instagram's tokenExpiresAt).
 *
 * Does NOT use GET /me/accounts. Confirmed against a real Page that lives
 * inside a Meta Business Portfolio: even with pages_show_list genuinely
 * granted (verified via /me/permissions), even picking that exact Page in
 * Meta's own Business Login asset picker, /me/accounts still returns an
 * empty list for it — no error, just nothing. Querying the Page node
 * directly by ID (GET /{page-id}?fields=id,name,access_token) with the same
 * user token works fine and returns a real Page access token, so the access
 * is real; /me/accounts is just an edge that doesn't enumerate
 * Business-Portfolio-assigned Pages reliably.
 *
 * The IDs a person actually granted through the asset picker are recovered
 * from GET /debug_token's `granular_scopes` instead — Meta's own record of
 * which specific asset IDs a config_id-based authorization covers,
 * independent of whatever /me/accounts does or doesn't list. Each granted ID
 * is then resolved individually via the direct Page-node query above.
 *
 * Falls back to the old /me/accounts call when a token has no
 * granular_scopes at all (e.g. a self-hoster using classic scope-based
 * Facebook Login instead of a Business Login config, where this
 * Business-Portfolio quirk doesn't apply and /me/accounts works normally).
 */
export async function getFacebookPages(
  userAccessToken: string
): Promise<FacebookManagedPage[]> {
  const grantedPageIds = await getGrantedPageIdsFromToken(userAccessToken);

  if (grantedPageIds.length > 0) {
    const pages = await Promise.all(
      grantedPageIds.map((pageId) => getFacebookPageById(pageId, userAccessToken))
    );
    return pages.filter((page): page is FacebookManagedPage => page !== null);
  }

  const url = new URL(facebookGraphUrl("/me/accounts"));
  url.searchParams.set("access_token", userAccessToken);
  url.searchParams.set("fields", "id,name,access_token");

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to list Facebook Pages: ${error.error?.message ?? JSON.stringify(error)}`
    );
  }

  const data = await response.json();
  return (data.data ?? []) as FacebookManagedPage[];
}

interface GranularScope {
  scope: string;
  target_ids?: string[];
}

async function getGrantedPageIdsFromToken(
  userAccessToken: string
): Promise<string[]> {
  const url = new URL(facebookGraphUrl("/debug_token"));
  url.searchParams.set("input_token", userAccessToken);
  url.searchParams.set(
    "access_token",
    `${requireEnv("FACEBOOK_APP_ID")}|${requireEnv("FACEBOOK_APP_SECRET")}`
  );

  const response = await fetch(url.toString());
  if (!response.ok) {
    // Non-fatal: callers fall back to /me/accounts on an empty array.
    return [];
  }

  const data = await response.json();
  const granularScopes: GranularScope[] = data.data?.granular_scopes ?? [];
  const pageIds = new Set<string>();
  for (const entry of granularScopes) {
    if (entry.scope.startsWith("pages_")) {
      for (const id of entry.target_ids ?? []) {
        pageIds.add(id);
      }
    }
  }

  return [...pageIds];
}

async function getFacebookPageById(
  pageId: string,
  userAccessToken: string
): Promise<FacebookManagedPage | null> {
  const url = new URL(facebookGraphUrl(`/${pageId}`));
  url.searchParams.set("fields", "id,name,access_token");
  url.searchParams.set("access_token", userAccessToken);

  const response = await fetch(url.toString());
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as FacebookManagedPage;
}
