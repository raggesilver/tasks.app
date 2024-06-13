import { deactivateInvitationSchema } from "~/lib/validation";
import { deactivateInvitationById } from "~/server/services/invitation";
import { getWorkspaceById } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const data = await readValidatedBody(
    event,
    deactivateInvitationSchema.parseAsync,
  );

  const workspace = await getWorkspaceById(user.id, data.workspaceId);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  if (workspace.ownerId !== user.id) {
    throw createError({
      status: 403,
      message:
        "You are not authorized to deactivate invitation links for this workspace",
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
