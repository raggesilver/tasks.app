import { getTaskById } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const taskId = getRouterParam(event, "id")!;

  const task = await getTaskById(taskId);

  if (!task) {
    throw createError({ status: 404, message: "Task not found" });
  }

  return task;
});
