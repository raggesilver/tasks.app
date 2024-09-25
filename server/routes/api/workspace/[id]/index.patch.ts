import { updateWorkspaceSchema, validateId } from "~/lib/validation";
import type { Workspace } from "~~/server/db/schema";
import { isUserAllowedToEditWorkspace } from "~~/server/services/authorization";
import {
  _getWorkspaceById,
  updateWorkspaceById,
} from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  const data = await readValidatedBody(event, updateWorkspaceSchema.parseAsync);

  const currentWorkspace = await _getWorkspaceById(id);

  if (!currentWorkspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  if (false === (await isUserAllowedToEditWorkspace(user, currentWorkspace))) {
    throw createError({
      status: 403,
      message: "You are not allowed to update this workspace",
    });
  }

  // Cast to non-null and tank the possibility of the workspace have been
  // deleted between the time we fetched it and the time we checked the
  // permissions.
  return updateWorkspaceById(id, data) as Promise<Workspace>;
});
