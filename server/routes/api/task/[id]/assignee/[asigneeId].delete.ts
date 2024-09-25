import { removeAssigneeFromTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const taskId = getRouterParam(event, "id")!;
  const asigneeId = getRouterParam(event, "asigneeId")!;

  return removeAssigneeFromTask(taskId, asigneeId).then((success) => {
    if (!success) {
      return sendNoContent(event, 404);
    }
    return sendNoContent(event);
  });
});
