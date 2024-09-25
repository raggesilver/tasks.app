import { validateId } from "~/lib/validation";
import { isUserWorkspaceCollaboratorForTask } from "~~/server/services/authorization";
import { getTaskById } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserWorkspaceCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view this task",
    });
  }

  const task = await getTaskById(taskId);

  if (!task) {
    throw createError({ status: 404, message: "Task not found" });
  }

  return task;
});
