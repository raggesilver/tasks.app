import { z } from "zod";
import { isUserAllowedToEditWorkspace } from "~~/server/services/authorization";
import {
  _getWorkspaceById,
  removeCollaboratorById,
} from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id, collaborator: collaboratorId } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string().uuid(),
      collaborator: z.string().uuid(),
    }).parse,
  );

  const workspace = await _getWorkspaceById(id);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  if (false === (await isUserAllowedToEditWorkspace(user, workspace))) {
    throw createError({
      status: 403,
      message: "You are not allowed to edit this workspace",
    });
  }

  const result = await removeCollaboratorById(id, collaboratorId);

  if (!result) {
    // We're not sure exactly what went wrong here, so we'll just return a
    // generic error
    throw createError({
      status: 400,
      message: "Failed to remove collaborator from workspace",
    });
  }

  return sendNoContent(event, 204);
});
