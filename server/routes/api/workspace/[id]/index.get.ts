import { validateId } from "~/lib/validation";
import { getWorkspaceById } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user: _user } = await requireUserSession(event);

  // TODO: verify if user has access to workspace

  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );
  const workspace = await getWorkspaceById(id);

  if (!workspace) {
    throw createError({
      status: 404,
      message: "Workspace not found",
    });
  }

  return workspace;
});
