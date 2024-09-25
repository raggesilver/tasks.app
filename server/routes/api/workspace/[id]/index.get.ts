import { getWorkspaceById } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({ status: 401, message: "Unauthorized" });
  }

  const id = getRouterParam(event, "id");

  const workspace = await getWorkspaceById(session.user.id, id!);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  return workspace;
});
