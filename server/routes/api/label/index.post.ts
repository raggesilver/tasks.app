import { createWorkspaceLabelSchema } from "~/lib/validation";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { createLabel } from "~~/server/services/label";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const data = await readValidatedBody(
    event,
    createWorkspaceLabelSchema.parseAsync,
  );

  if (
    false === (await isUserWorkspaceCollaborator(user.id, data.workspaceId))
  ) {
    throw createError({
      status: 403,
      message: "You are not authorized to modify this workspace",
    });
  }

  return createLabel(data);
});
