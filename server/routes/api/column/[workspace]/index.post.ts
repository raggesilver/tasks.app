import { createStatusColumnSchema } from "~/lib/validation";
import type { StatusColumn } from "~/server/db/schema";
import { createStatusColumn } from "~/server/services/columns";
import { getWorkspaceById } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const workspaceId = getRouterParam(event, "workspace")!;
  const data = await readValidatedBody(event, createStatusColumnSchema.parse);

  const workspace = await getWorkspaceById(session.user.id, workspaceId);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  const column = await createStatusColumn({
    ...data,
    userId: session.user.id,
    workspaceId: workspace.id,
  });

  return column as StatusColumn;
});
