import { z } from "zod";
import { isUserAllowedToModifyWorkspace } from "~~/server/services/authorization";
import { removeWorkspaceCollaborator } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id, collaborator } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string().uuid(),
      collaborator: z.string().uuid(),
    }).parseAsync,
  );

  if (false === (await isUserAllowedToModifyWorkspace(user, id))) {
    throw createError({
      status: 403,
      message: "You are not allowed to modify this workspace",
    });
  }

  const removed = await removeWorkspaceCollaborator(id, collaborator);

  if (!removed) {
    throw createError({
      status: 404,
      message: "User or workspace not found",
    });
  }

  return sendNoContent(event, 204);
});
