import { updateStatusColumnSchema } from "~/lib/validation";
import type { StatusColumn } from "~~/server/db/schema";
import { updateStatusColumn } from "~~/server/services/columns";
import { getWorkspaceById } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const workspaceId = getRouterParam(event, "workspace")!;
  const columnId = getRouterParam(event, "id")!;

  const data = await readValidatedBody(event, updateStatusColumnSchema.parse);

  const workspace = await getWorkspaceById(session.user.id, workspaceId);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  const column = await updateStatusColumn(workspace.id, columnId, data);

  if (!column) {
    throw createError({ status: 404, message: "Column not found" });
  }

  return column as StatusColumn;
});
