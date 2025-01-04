import { validateId } from "~/lib/validation";
import { attachmentService } from "~~/server/services/attachment";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { usageService } from "~~/server/services/usage";

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

  const storageUsage = await attachmentService.getUsageForWorkspace(id);
  const collaborator = await usageService.getCollaboratorUsage(id);

  return { usage: storageUsage, collaborator };
});
