import { deleteStatusColumn } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const workspaceId = getRouterParam(event, "workspace")!;
  const columnId = getRouterParam(event, "id")!;

  // TODO: check if the user has access to the workspace
  const response = await deleteStatusColumn(workspaceId, columnId);

  if (!response) {
    throw createError({ status: 404, message: "Column not found" });
  }

  return sendNoContent(event, 204);
});
