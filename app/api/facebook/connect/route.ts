import { NextResponse } from "next/server";
import { canManageWorkspace, getCurrentWorkspaceContext } from "@/lib/workspace-access";
import { getBaseUrl, getMissingFacebookOAuthEnv } from "@/lib/env";
import { createOAuthState, getFacebookAuthorizationUrl } from "@/lib/meta/oauth";

export async function GET() {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.redirect(`${getBaseUrl()}/login`);
  }
  if (!canManageWorkspace(context.role)) {
    return NextResponse.redirect(`${getBaseUrl()}/settings?facebook=forbidden`);
  }

  const missingEnv = getMissingFacebookOAuthEnv();
  if (missingEnv.length > 0) {
    return NextResponse.redirect(
      `${getBaseUrl()}/settings?facebook=misconfigured&missing=${encodeURIComponent(
        missingEnv.join(",")
      )}`
    );
  }

  const redirectUri = `${getBaseUrl()}/api/facebook/callback`;
  // Reuses the same OAuth state signing as Instagram (createOAuthState /
  // verifyOAuthState in lib/meta/oauth.ts) — it only carries workspaceId and
  // isn't channel-specific.
  const state = createOAuthState(context.workspaceId);

  return NextResponse.redirect(getFacebookAuthorizationUrl(redirectUri, state));
}
