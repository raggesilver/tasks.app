import { publicUserSchema, validateId } from "~/lib/validation";
import { isUserBoardCollaborator } from "~~/server/services/authorization";
import { _getBoardById, getBoardCollaborators } from "~~/server/services/board";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: boardId } = await getValidatedRouterParams(
    event,
    validateId("id").parse,
  );

  const board = await _getBoardById(boardId);

  if (!board) {
    throw createError({ status: 404, message: "Board not found" });
  }

  if (false === (await isUserBoardCollaborator(user.id, board.id))) {
    throw createError({
      status: 403,
      message: "You are not allowed to view this board",
    });
  }

  return getBoardCollaborators(boardId).then(
    publicUserSchema.array().parseAsync,
  );
});
