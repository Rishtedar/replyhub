import { prisma } from "@/lib/db/client";

export async function canConnectFacebookPage({
  workspaceId,
  pageId,
}: {
  workspaceId: string;
  pageId: string;
}) {
  const existingPage = await prisma.facebookPage.findUnique({
    where: { pageId },
    select: { workspaceId: true },
  });

  if (existingPage && existingPage.workspaceId !== workspaceId) {
    return {
      allowed: false,
      reason: "already_connected" as const,
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}

export async function getWorkspaceFacebookPage(
  workspaceId: string,
  facebookPageId?: string | null
) {
  if (facebookPageId && facebookPageId !== "all") {
    return prisma.facebookPage.findFirst({
      where: { id: facebookPageId, workspaceId },
    });
  }

  return prisma.facebookPage.findFirst({
    where: { workspaceId },
    orderBy: { connectedAt: "desc" },
  });
}
