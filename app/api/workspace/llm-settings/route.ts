import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import {
  canManageWorkspace,
  getCurrentWorkspaceContext,
} from "@/lib/workspace-access";

// Empty string clears the field (disabling the LLM fallback for every
// automation in the workspace — see the schema comment on
// Workspace.llmBusinessContext for why both fields are required together).
const updateLlmSettingsSchema = z.object({
  llmBusinessContext: z.union([z.string().max(4000), z.literal("")]),
  llmRedirectLink: z.union([z.string().url(), z.literal("")]),
});

export async function PATCH(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!canManageWorkspace(context.role)) {
    return NextResponse.json(
      {
        success: false,
        error: "Only owners and admins can change the AI fallback settings",
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateLlmSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.update({
    where: { id: context.workspaceId },
    data: {
      llmBusinessContext: parsed.data.llmBusinessContext || null,
      llmRedirectLink: parsed.data.llmRedirectLink || null,
    },
    select: { llmBusinessContext: true, llmRedirectLink: true },
  });

  return NextResponse.json({ success: true, data: workspace });
}
