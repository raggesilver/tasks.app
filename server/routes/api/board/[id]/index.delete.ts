import { validateId } from "~/lib/validation";
import { isUserAllowedToDeleteBoard } from "~~/server/services/authorization";
import { _getBoardById, deleteBoardById } from "~~/server/services/board";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  const currentBoard = await _getBoardById(id);

  if (!currentBoard) {
    throw createError({ status: 404, message: "Board not found" });
  }

  if (false === (await isUserAllowedToDeleteBoard(user, currentBoard))) {
    throw createError({
      status: 403,
      message: "You are not allowed to delete this board",
    });
  }

  await deleteBoardById(id);
  return sendNoContent(event, 204);
});
