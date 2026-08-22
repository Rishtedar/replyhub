import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getBaseUrl } from "@/lib/env";
import { canConnectFacebookPage } from "@/lib/facebook-pages";
import { subscribePageToWebhooks } from "@/lib/meta/client";
import {
  encryptToken,
  exchangeFacebookCodeForToken,
  getFacebookPages,
  getLongLivedFacebookUserToken,
  verifyOAuthState,
} from "@/lib/meta/oauth";
import { canManageWorkspace } from "@/lib/workspace-access";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = verifyOAuthState(request.nextUrl.searchParams.get("state"));
  const baseUrl = getBaseUrl();

  if (error) {
    return NextResponse.redirect(`${baseUrl}/settings?facebook=denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/settings?facebook=invalid`);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId: state.workspaceId, userId: session.user.id },
  });

  if (!membership || !canManageWorkspace(membership.role)) {
    return NextResponse.redirect(`${baseUrl}/settings?facebook=forbidden`);
  }

  try {
    const redirectUri = `${baseUrl}/api/facebook/callback`;
    const { accessToken: shortLivedToken } = await exchangeFacebookCodeForToken(
      code,
      redirectUri
    );
    const { accessToken: longLivedUserToken } =
      await getLongLivedFacebookUserToken(shortLivedToken);

    const pages = await getFacebookPages(longLivedUserToken);

    if (pages.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/settings?facebook=no_pages`
      );
    }

    // Phase-1 limit, deliberate: connecting more than one Page in the same
    // authorization would need a picker UI we haven't built yet. Failing
    // loudly here beats silently connecting the wrong Page — see the plan
    // doc / social_autoreply_project.md memory for why this is scoped down.
    if (pages.length > 1) {
      return NextResponse.redirect(
        `${baseUrl}/settings?facebook=multiple_pages&count=${pages.length}`
      );
    }

    const page = pages[0];
    const connection = await canConnectFacebookPage({
      workspaceId: state.workspaceId,
      pageId: page.id,
    });

    if (!connection.allowed) {
      return NextResponse.redirect(
        `${baseUrl}/settings?facebook=already_connected`
      );
    }

    const encryptedToken = encryptToken(page.access_token);

    let webhookSubscribed = false;
    try {
      const subscription = await subscribePageToWebhooks(
        page.id,
        page.access_token
      );
      webhookSubscribed = Boolean(subscription.success);
    } catch (subscriptionError) {
      console.warn(
        "[Facebook Callback] Webhook subscription failed:",
        subscriptionError
      );
    }

    await prisma.facebookPage.upsert({
      where: { pageId: page.id },
      create: {
        workspaceId: state.workspaceId,
        pageId: page.id,
        name: page.name,
        accessToken: encryptedToken,
        webhookSubscribed,
      },
      update: {
        workspaceId: state.workspaceId,
        name: page.name,
        accessToken: encryptedToken,
        webhookSubscribed,
      },
    });

    return NextResponse.redirect(`${baseUrl}/dashboard?connected=true`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Facebook Callback] Error:", err);
    await prisma.operationalEvent
      .create({
        data: {
          source: "SYSTEM",
          level: "ERROR",
          workspaceId: state.workspaceId,
          message: "Facebook Page connection failed",
          payload: { reason: message },
        },
      })
      .catch(() => {});

    return NextResponse.redirect(
      `${baseUrl}/settings?facebook=failed&reason=${encodeURIComponent(
        message.slice(0, 200)
      )}`
    );
  }
}
