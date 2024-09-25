import { z } from "zod";
import { createTaskSchema } from "~/lib/validation";
import type { TaskWithEverything } from "~~/server/db/schema";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { createTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { workspace: workspaceId, id: columnId } =
    await getValidatedRouterParams(
      event,
      z.object({
        workspace: z.string().uuid(),
        id: z.string().uuid(),
      }).parseAsync,
    );

  const data = await readValidatedBody(event, createTaskSchema.parseAsync);

  if (
    false === (await isUserWorkspaceCollaborator(session.user.id, workspaceId))
  ) {
    throw createError({
      status: 403,
      message: "You are not authorized to create tasks in this workspace",
    });
  }

  const task: TaskWithEverything = await createTask({
    workspaceId,
    statusColumnId: columnId,
    createdById: session.user.id,
    ...data,
  });

  return task;
});
