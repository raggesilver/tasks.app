import { getAllBoards } from "~~/server/services/board";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  return getAllBoards(user.id);
});
