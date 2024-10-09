import { validateId } from "~/lib/validation";
import { isUserAllowedToViewBoard } from "~~/server/services/authorization";
import { _getBoardById } from "~~/server/services/board";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  const board = await _getBoardById(id);

  if (!board) {
    throw createError({ status: 404, message: "Board not found" });
  }

  if (false === (await isUserAllowedToViewBoard(user, board))) {
    throw createError({
      status: 403,
      message: "You are not allowed to view this board",
    });
  }

  return board;
});
