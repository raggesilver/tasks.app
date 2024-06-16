import { createInvitationSchema } from "~/lib/validation";
import { createInvitation } from "~/server/services/invitation";
import { getWorkspaceById } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const data = await readValidatedBody(
    event,
    createInvitationSchema.parseAsync,
  );

  const workspace = await getWorkspaceById(user.id, data.workspaceId);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  if (workspace.ownerId !== user.id) {
    throw createError({
      status: 403,
      message:
        "You are not authorized to create invitation links for this workspace",
    });
  }

  return createInvitation(data);
});
