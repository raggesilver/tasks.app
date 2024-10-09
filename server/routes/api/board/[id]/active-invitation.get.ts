import { validateId } from "~/lib/validation";
import { isUserAllowedToViewBoard } from "~~/server/services/authorization";
import { getActiveInvitationForBoard } from "~~/server/services/invitation";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  // TODO: we may want to throw a 404 if the board does not exist

  // TODO: we still need to better define the permissions for this endpoint. We
  // haven't yet decided if we want to allow collaborators to view the active
  // invitation link.

  if (false === (await isUserAllowedToViewBoard(user, id))) {
    throw createError({
      status: 403,
      message: "You are not allowed to view this board",
    });
  }

  return getActiveInvitationForBoard(id);
});
