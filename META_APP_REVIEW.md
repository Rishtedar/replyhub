# Meta App Review notes

You only need App Review if you want people who are not testers on your app to connect their own Instagram accounts or Facebook Pages. If you run AutoReply for your own accounts only, skip this — Development mode with testers never expires and never needs review.

AutoReply uses the official Instagram and Facebook APIs to reply publicly to a keyword comment and/or send the commenter a one-time private DM, on a connected professional account's post/reel or a connected Facebook Page's post.

## Permissions to request

**Instagram**
- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`
- `instagram_business_manage_insights` (already used for analytics; include if the Overview page ships to reviewed accounts)

**Facebook**
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`
- `pages_read_user_content` — **prerequisite for `pages_manage_engagement`**, must be requested alongside it or the request is rejected
- `pages_manage_engagement` — lets the app post a public reply under a Page post comment (Facebook's equivalent of `instagram_business_manage_comments`'s reply capability). Not selectable under Standard Access in the permission picker; only becomes requestable once you start an App Review submission — confirmed 2026-08-23.

## Permission justifications

Paste these into the App Review request, adjusted to your wording.

`instagram_business_basic`. We use this to identify the connected Instagram professional account after the user authorizes through Instagram business login, so we can associate the account with their workspace and show which account each automation belongs to.

`instagram_business_manage_comments`. When a follower comments a keyword the account owner configured on the owner's own post or reel, we receive the comment through the comments webhook and, if the owner enabled it, post a public reply under that comment. We only act on comments on the connecting account's own media.

`instagram_business_manage_messages`. After a follower comments a configured keyword, we send that follower a one-time private reply with content the account owner set up, typically a link or answer the follower asked for by commenting. This is the standard Instagram comment-to-DM flow. We send one reply per matching comment and respect Meta's rate limits.

`pages_show_list`. Lets the account owner pick which of their Facebook Pages to connect during onboarding.

`pages_read_engagement` / `pages_read_user_content`. We receive Page post comments through the comments webhook to detect the keyword the Page owner configured. Read-only — we do not read messages or content unrelated to the configured campaigns.

`pages_manage_metadata`. Required to subscribe the connected Page to our webhook so we receive comment and Messenger events in real time.

`pages_messaging`. After a commenter's keyword matches, we send that person a one-time Messenger DM with content the Page owner set up — the same comment-to-DM flow as Instagram, on Facebook.

`pages_manage_engagement`. When enabled by the Page owner, we post a public reply under the matched comment, in addition to the private DM — parity with the Instagram flow. Optional per campaign; off by default.

## Screencast requirements (corrected 2026-08-23 — the old single-take script below is outdated)

Meta's current guidance (verified against developers.facebook.com's submission guide) is stricter than a single narrated walkthrough:

- **One video per permission/feature**, not one combined video covering several. A submission that bundles multiple permissions into one clip risks rejection.
- 1080p minimum, capture window ≤1440px wide.
- **No audio narration** — use on-screen captions/tooltips instead.
- Visible, enlarged mouse cursor.
- English UI preferred for the recording.
- Each video needs a paired written description of how that specific permission is used (a video without a matching description is an automatic rejection).

Practical script per permission (adapt per clip, same underlying flow, just crop/caption to the one permission each video is proving):

1. Sign in with an email magic link.
2. Go to Settings, click Connect Instagram (or Connect Facebook Page). Show the consent screen with the exact permission being requested visible.
3. Create a campaign on a recent post/Page post with keyword `LINK`, a DM message, save.
4. On a second phone or account, comment `LINK` on that post.
5. Show the result the permission being proven produces: the DM arriving (for `*_manage_messages`/`pages_messaging`), or the public reply appearing under the comment (for `instagram_business_manage_comments`/`pages_manage_engagement`), or the Page picker (for `pages_show_list`).
6. Back in the app, show the corresponding SENT row in DM Logs.

## Compliance positioning

- The app never scrapes Instagram/Facebook and never asks for a password.
- It only sends a reply when someone comments on the connected account's/Page's own content.
- Tokens are encrypted at rest with AES-256-GCM.
- Users can disconnect Instagram or a Facebook Page from Settings.
- Per-account rate limiting and deduplication prevent spammy behavior.

## Business verification

Required before Meta grants Advanced Access for any of the permissions above. As of 2026-08-23:

- One legal document (PDF or clear image, under 8MB) proving the business — registration, articles of incorporation, tax document, or business bank statement — plus separate proof of address. Both the legal name and the address/phone should ideally appear on the same document.
- **The legal name on the document must match the legal entity name entered in the Meta Business Manager exactly** — mismatch is the single most common rejection reason. Confirm the Business Manager's "Nombre legal del negocio" field is filled with HojaCero's exact registered name before submitting, not the trading name "HojaCero" alone if the RUT is registered under a different legal name (e.g. "HojaCero SpA" vs "HojaCero").
- A corporate-domain contact email (not Gmail/Hotmail) roughly halves typical review time.
- Turnaround: 3–7 business days typically, up to ~10 during Meta's quarterly policy review windows. Independent of the App Review decision itself, which currently runs 1–3 weeks depending on load — plan for this to take the app review's whole timeline, not a quick side step.
- If the business can't complete verification, the fallback is running AutoReply for your own accounts as testers indefinitely — that path never needs App Review.

## Where this stands for AutoReply (2026-08-23)

- App "Rishtedar Reply" (id `2146407749616657`) currently sits under the "Rishtedar Restaurant" Business Manager. Plan is to move it to the "HojaCero" Business Manager (id `923835464149234`) before submitting, so Advanced Access and the business verification are owned by HojaCero — reusable for every future AutoReply client instead of being tied to one restaurant.
- HojaCero's Business Manager exists but is **unverified**, with legal name and address fields still empty — first concrete step is filling those in and starting verification, independent of anything else (zero risk to Rishtedar's current working integration).
- Instagram flow has real production confirmation (DM delivery) from earlier session work; Facebook flow (comment → DM) has been confirmed with a real delivered Messenger DM as well — the Instagram-side end-to-end confirmation with a real posted comment (not just Facebook's) is still outstanding, see project memory.
