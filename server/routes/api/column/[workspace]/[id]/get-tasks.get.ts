import { z } from "zod";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { getTasksForStatusColumn } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { workspace: workspaceId, statusColumn: statusColumnId } =
    await getValidatedRouterParams(
      event,
      z.object({
        workspace: z.string().uuid(),
        statusColumn: z.string().uuid(),
      }).parseAsync,
    );

  if (false === (await isUserWorkspaceCollaborator(user.id, workspaceId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view tasks in this workspace",
    });
  }

  return getTasksForStatusColumn(workspaceId, statusColumnId);
});
