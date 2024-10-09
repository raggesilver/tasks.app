import { z } from "zod";
import { isUserBoardCollaboratorForTask } from "~~/server/services/authorization";
import { removeLabelFromTask } from "~~/server/services/task";

const paramsSchema = z.object({
  id: z.string().uuid(),
  labelId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId, labelId } = await getValidatedRouterParams(
    event,
    paramsSchema.parseAsync,
  );

  if (false === (await isUserBoardCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to modify this task",
    });
  }

  const result = await removeLabelFromTask(taskId, labelId);

  return sendNoContent(event, result ? 204 : 404);
});
