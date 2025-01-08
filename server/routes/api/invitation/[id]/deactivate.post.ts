import { validateId } from "~/lib/validation";
import {
  isUserAllowedToCreateOrModifyBoardInvitation,
  isUserAllowedToCreateOrModifyWorkspaceInvitation,
} from "~~/server/services/authorization";
import {
  deactivateInvitationById,
  getInvitationById,
} from "~~/server/services/invitation";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id: invitationId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  const invitation = await getInvitationById(invitationId);

  if (!invitation) {
    throw createError({
      status: 404,
      message: "Invitation not found",
    });
  }

  if (invitation.boardId) {
    if (
      false ===
      (await isUserAllowedToCreateOrModifyBoardInvitation(
        user.id,
        invitation.boardId,
      ))
    ) {
      throw createError({
        status: 403,
        message: "You are not authorized to deactivate this invitation",
      });
    }
  } else {
    if (
      false ===
      (await isUserAllowedToCreateOrModifyWorkspaceInvitation(
        user.id,
        invitation.workspaceId!,
      ))
    ) {
      throw createError({
        status: 403,
        message: "You are not authorized to deactivate this invitation",
      });
    }
  }

  return deactivateInvitationById(invitation.id);
});
