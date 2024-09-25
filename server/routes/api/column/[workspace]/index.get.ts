import { getStatusColumns } from "~~/server/services/columns";
import { getWorkspaceById } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const workspaceId = getRouterParam(event, "workspace")!;

  const workspace = await getWorkspaceById(session.user.id, workspaceId);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  const column = await getStatusColumns(workspace.id);

  return column;
});
