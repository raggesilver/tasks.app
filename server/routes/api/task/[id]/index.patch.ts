import { updateTaskSchema } from "~/lib/validation";
import { updateTask } from "~/server/services/task";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const taskId = getRouterParam(event, "id")!;
  const data = await readValidatedBody(event, updateTaskSchema.parse);

  console.log({ data });

  const task = await updateTask(taskId, session.user.id, data);

  if (!task) {
    throw createError({ status: 404, message: "Task not found" });
  }

  return task;
});
