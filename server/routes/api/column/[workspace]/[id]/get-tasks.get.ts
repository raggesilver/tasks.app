import { getTasksForStatusColumn } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const workspaceId = getRouterParam(event, "workspace")!;
  const statusColumnId = getRouterParam(event, "id")!;

  // TODO: validate that the user has access to the workspace

  const tasks = await getTasksForStatusColumn(workspaceId, statusColumnId);

  return tasks;
});
