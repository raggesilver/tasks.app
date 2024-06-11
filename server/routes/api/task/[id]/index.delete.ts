import { deleteTask } from "~/server/services/task";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const taskId = getRouterParam(event, "id")!;

  const result = await deleteTask(taskId);

  if (!result) {
    throw createError({ status: 404, message: "Task not found" });
  }

  return sendNoContent(event, 204);
});
