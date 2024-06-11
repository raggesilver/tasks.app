import { deleteWorkspaceById } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const id = getRouterParam(event, "id")!;

  const workspace = await deleteWorkspaceById(id);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  return sendNoContent(event, 204);
});
