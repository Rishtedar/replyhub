import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getRequestIp, hashClickIp } from "@/lib/tracking/server";

type RedirectRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: RedirectRouteProps) {
  const { slug } = await params;
  const trackedLink = await prisma.trackedLink.findUnique({
    where: { slug },
    select: {
      id: true,
      workspaceId: true,
      automationId: true,
      destinationUrl: true,
      automation: {
        select: {
          instagramAccountId: true,
        },
      },
    },
  });

  if (!trackedLink) {
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }

  // Tracked links are only ever created for Instagram automations in this
  // phase (Facebook automations don't get trackedLinks yet — see the schema
  // comment on FacebookPage). A null instagramAccountId here means the
  // click's parent automation somehow targets Facebook instead — redirect
  // the visitor regardless, just skip the analytics row rather than crash on
  // a LinkClick.instagramAccountId that has no value to record.
  if (trackedLink.automation.instagramAccountId) {
    await prisma.linkClick.create({
      data: {
        workspaceId: trackedLink.workspaceId,
        automationId: trackedLink.automationId,
        instagramAccountId: trackedLink.automation.instagramAccountId,
        trackedLinkId: trackedLink.id,
        ipHash: hashClickIp(getRequestIp(request)),
        userAgent: request.headers.get("user-agent"),
        referrer: request.headers.get("referer"),
      },
    });
  }

  return NextResponse.redirect(trackedLink.destinationUrl, { status: 302 });
}
