import { validateId } from "~/lib/validation";
import { isUserWorkspaceCollaboratorForTask } from "~~/server/services/authorization";
import { deleteTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserWorkspaceCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to delete this task",
    });
  }

  const result = await deleteTask(taskId);

  if (!result) {
    throw createError({ status: 404, message: "Task not found" });
  }

  return sendNoContent(event, 204);
});
