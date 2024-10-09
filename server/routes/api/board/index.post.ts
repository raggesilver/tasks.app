import { createBoardSchema } from "~/lib/validation";
import { createBoard } from "~~/server/services/board";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { name } = await readValidatedBody(event, createBoardSchema.parse);

  const board = await createBoard(user.id, { name });

  return board;
});
