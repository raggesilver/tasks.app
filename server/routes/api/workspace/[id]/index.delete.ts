import { validateId } from "~/lib/validation";
import { isUserAllowedToDeleteWorkspace } from "~~/server/services/authorization";
import {
  _getWorkspaceById,
  deleteWorkspaceById,
} from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  const currentWorkspace = await _getWorkspaceById(id);

  if (!currentWorkspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  if (
    false === (await isUserAllowedToDeleteWorkspace(user, currentWorkspace))
  ) {
    throw createError({
      status: 403,
      message: "You are not allowed to delete this workspace",
    });
  }

  await deleteWorkspaceById(id);
  return sendNoContent(event, 204);
});
