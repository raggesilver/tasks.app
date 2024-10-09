import { updateTaskSchema, validateId } from "~/lib/validation";
import { isUserBoardCollaboratorForTask } from "~~/server/services/authorization";
import { updateTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserBoardCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to modify this task",
    });
  }

  const data = await readValidatedBody(event, updateTaskSchema.parseAsync);

  const task = await updateTask(taskId, user.id, data);

  if (!task) {
    throw createError({ status: 404, message: "Task not found" });
  }

  return task;
});
