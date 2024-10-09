import { validateId } from "~/lib/validation";
import { isUserBoardCollaborator } from "~~/server/services/authorization";
import { getStatusColumns } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { board: boardId } = await getValidatedRouterParams(
    event,
    validateId("board").parseAsync,
  );

  if (false === (await isUserBoardCollaborator(user.id, boardId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view columns in this board",
    });
  }

  return getStatusColumns(boardId);
});
