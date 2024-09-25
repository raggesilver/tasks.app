import { validateId } from "~/lib/validation";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { getStatusColumns } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { workspace: workspaceId } = await getValidatedRouterParams(
    event,
    validateId("workspace").parseAsync,
  );

  if (false === (await isUserWorkspaceCollaborator(user.id, workspaceId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view columns in this workspace",
    });
  }

  return getStatusColumns(workspaceId);
});
