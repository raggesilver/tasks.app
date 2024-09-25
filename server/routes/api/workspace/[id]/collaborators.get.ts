import { publicUserSchema, validateId } from "~/lib/validation";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import {
  _getWorkspaceById,
  getWorkspaceCollaborators,
} from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: workspaceId } = await getValidatedRouterParams(
    event,
    validateId("id").parse,
  );

  const workspace = await _getWorkspaceById(workspaceId);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  if (false === (await isUserWorkspaceCollaborator(user.id, workspace.id))) {
    throw createError({
      status: 403,
      message: "You are not allowed to view this workspace",
    });
  }

  return getWorkspaceCollaborators(workspaceId).then(
    publicUserSchema.array().parseAsync,
  );
});
