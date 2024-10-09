import { z } from "zod";
import { createTaskSchema } from "~/lib/validation";
import type { TaskWithEverything } from "~~/server/db/schema";
import { isUserBoardCollaborator } from "~~/server/services/authorization";
import { createTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { board: boardId, id: columnId } = await getValidatedRouterParams(
    event,
    z.object({
      board: z.string().uuid(),
      id: z.string().uuid(),
    }).parseAsync,
  );

  const data = await readValidatedBody(event, createTaskSchema.parseAsync);

  if (false === (await isUserBoardCollaborator(session.user.id, boardId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to create tasks in this board",
    });
  }

  const task: TaskWithEverything = await createTask({
    boardId,
    statusColumnId: columnId,
    createdById: session.user.id,
    ...data,
  });

  return task;
});
