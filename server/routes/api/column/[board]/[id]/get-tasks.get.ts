import { z } from "zod";
import { isUserBoardCollaborator } from "~~/server/services/authorization";
import { getTasksForStatusColumn } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { board: boardId, id: statusColumnId } = await getValidatedRouterParams(
    event,
    z.object({
      board: z.string().uuid(),
      id: z.string().uuid(),
    }).parseAsync,
  );

  if (false === (await isUserBoardCollaborator(user.id, boardId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view tasks in this board",
    });
  }

  return getTasksForStatusColumn(boardId, statusColumnId);
});
