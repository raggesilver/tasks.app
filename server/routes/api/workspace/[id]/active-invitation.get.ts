import { validateId } from "~/lib/validation";
import { isUserAllowedToCreateOrModifyWorkspaceInvitation } from "~~/server/services/authorization";
import { getActiveInvitationForWorkspace } from "~~/server/services/invitation";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id: workspaceId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (
    false ===
    (await isUserAllowedToCreateOrModifyWorkspaceInvitation(
      user.id,
      workspaceId,
    ))
  ) {
    throw createError({
      message: "Not allowed to create or modify workspace invitation",
      status: 403,
    });
  }

  return getActiveInvitationForWorkspace(workspaceId);
});
