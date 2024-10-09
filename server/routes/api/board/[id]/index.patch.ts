import { updateBoardSchema, validateId } from "~/lib/validation";
import type { Board } from "~~/server/db/schema";
import { isUserAllowedToEditBoard } from "~~/server/services/authorization";
import { _getBoardById, updateBoardById } from "~~/server/services/board";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  const data = await readValidatedBody(event, updateBoardSchema.parseAsync);

  const currentBoard = await _getBoardById(id);

  if (!currentBoard) {
    throw createError({ status: 404, message: "Board not found" });
  }

  if (false === (await isUserAllowedToEditBoard(user, currentBoard))) {
    throw createError({
      status: 403,
      message: "You are not allowed to update this board",
    });
  }

  // Cast to non-null and tank the possibility of the board have been
  // deleted between the time we fetched it and the time we checked the
  // permissions.
  return updateBoardById(id, data) as Promise<Board>;
});
