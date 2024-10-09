import { z } from "zod";
import { isUserBoardCollaboratorForTask } from "~~/server/services/authorization";
import { removeAssigneeFromTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId, assigneeId } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string().uuid(),
      assigneeId: z.string().uuid(),
    }).parseAsync,
  );

  if (false === (await isUserBoardCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to modify this task",
    });
  }

  return removeAssigneeFromTask(taskId, assigneeId).then((success) => {
    if (!success) {
      return sendNoContent(event, 404);
    }
    return sendNoContent(event);
  });
});
