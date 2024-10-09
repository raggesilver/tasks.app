import { deactivateInvitationSchema } from "~/lib/validation";
import { isUserAllowedToCreateOrModifyBoardInvitation } from "~~/server/services/authorization";
import { deactivateInvitationById } from "~~/server/services/invitation";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const data = await readValidatedBody(
    event,
    deactivateInvitationSchema.parseAsync,
  );

  if (
    false ===
    (await isUserAllowedToCreateOrModifyBoardInvitation(user.id, data.boardId))
  ) {
    throw createError({
      status: 403,
      message: "You are not authorized to deactivate this invitation",
    });
  }

  const invitation = await deactivateInvitationById(data.invitationId);

  if (!invitation) {
    throw createError({
      status: 404,
      message: "Invitation not found",
    });
  }

  return invitation;
});
