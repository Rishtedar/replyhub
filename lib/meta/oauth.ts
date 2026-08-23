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
  const params = new URLSearchParams({
    client_id: requireEnv("FACEBOOK_APP_ID"),
    redirect_uri: redirectUri,
    // pages_manage_posts is deliberately excluded — this app never creates
    // Page posts (no /{page-id}/feed call anywhere), only replies to
    // existing comments (POST /{comment-id}/comments, covered by
    // pages_read_engagement) and manages Messenger. Requesting it made Meta
    // reject the whole OAuth dialog with "Invalid Scopes" since the app was
    // never granted that permission.
    scope:
      "pages_show_list,pages_messaging,pages_manage_metadata,pages_read_engagement",
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
 */
export async function getFacebookPages(
  userAccessToken: string
): Promise<FacebookManagedPage[]> {
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
