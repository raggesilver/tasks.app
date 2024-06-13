import { z } from "zod";
import { getInvitationByToken } from "~/server/services/invitation";
import { addCollaboratorById } from "~/server/services/workspace";

const schema = z.object({
  token: z.string(),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const query = await getValidatedQuery(event, schema.parseAsync);

  const invitation = await getInvitationByToken(query.token);

  if (!invitation) {
    throw createError({ status: 400, message: "Invalid token" });
  }

  if (!invitation.active) {
    throw createError({
      status: 400,
      message: "This invitation link has expired",
    });
  }

  await addCollaboratorById(invitation.workspaceId, user.id);

  return sendRedirect(event, `/app/workspace/${invitation.workspaceId}`);
});
