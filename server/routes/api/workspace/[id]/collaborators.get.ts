import { validateId } from "~/lib/validation";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { getWorkspaceCollaborators } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (!(await isUserWorkspaceCollaborator(user.id, id))) {
    throw createError({
      status: 403,
      message: "You are not allowed to view this workspace.",
    });
  }

  return getWorkspaceCollaborators(id);
});
