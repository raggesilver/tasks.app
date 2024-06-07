import { createTaskSchema } from "~/lib/validation";
import { createTask } from "~/server/services/task";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const workspaceId = getRouterParam(event, "workspace")!;
  const columnId = getRouterParam(event, "id")!;

  const data = await readValidatedBody(event, createTaskSchema.parse);

  // TODO: validate that workspace and column exist
  // TODO: validate that user has access to workspace

  const task = await createTask({
    workspaceId,
    statusColumnId: columnId,
    createdById: session.user.id,
    ...data,
  });

  return task;
});
