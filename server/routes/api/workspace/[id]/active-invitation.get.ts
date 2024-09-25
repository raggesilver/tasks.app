import { validateId } from "~/lib/validation";
import { isUserAllowedToViewWorkspace } from "~~/server/services/authorization";
import { getActiveInvitationForWorkspace } from "~~/server/services/invitation";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  // TODO: we may want to throw a 404 if the workspace does not exist

  // TODO: we still need to better define the permissions for this endpoint. We
  // haven't yet decided if we want to allow collaborators to view the active
  // invitation link.

  if (false === (await isUserAllowedToViewWorkspace(user, id))) {
    throw createError({
      status: 403,
      message: "You are not allowed to view this workspace",
    });
  }

  return getActiveInvitationForWorkspace(id);
});
