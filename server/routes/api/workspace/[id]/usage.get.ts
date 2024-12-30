import { validateId } from "~/lib/validation";
import { attachmentService } from "~~/server/services/attachment";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserWorkspaceCollaborator(user.id, id))) {
    throw createError({
      status: 403,
      message: "You are not authorized to access this workspace",
    });
  }

  const usage = await attachmentService.getUsageForWorkspace(id);

  return { usage };
});
