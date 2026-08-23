-- AlterTable
ALTER TABLE "Automation" ADD COLUMN     "facebookPageId" TEXT,
ADD COLUMN     "llmFallbackEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "instagramAccountId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DmLog" ADD COLUMN     "facebookPageId" TEXT,
ALTER COLUMN "instagramAccountId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProcessedComment" ADD COLUMN     "facebookPageId" TEXT,
ALTER COLUMN "instagramAccountId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "llmBusinessContext" TEXT,
ADD COLUMN     "llmRedirectLink" TEXT;

-- CreateTable
CREATE TABLE "FacebookPage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "webhookSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacebookPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookPage_pageId_key" ON "FacebookPage"("pageId");

-- CreateIndex
CREATE INDEX "FacebookPage_workspaceId_idx" ON "FacebookPage"("workspaceId");

-- CreateIndex
CREATE INDEX "Automation_facebookPageId_idx" ON "Automation"("facebookPageId");

-- CreateIndex
CREATE INDEX "DmLog_facebookPageId_idx" ON "DmLog"("facebookPageId");

-- CreateIndex
CREATE INDEX "ProcessedComment_facebookPageId_idx" ON "ProcessedComment"("facebookPageId");

-- AddForeignKey
ALTER TABLE "FacebookPage" ADD CONSTRAINT "FacebookPage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "FacebookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmLog" ADD CONSTRAINT "DmLog_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "FacebookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
