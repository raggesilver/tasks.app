import { z } from "zod";
import { isUserAllowedToCreateOrModifyColumns } from "~~/server/services/authorization";
import { deleteStatusColumn } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { board: boardId, id: columnId } = await getValidatedRouterParams(
    event,
    z.object({
      board: z.string().uuid(),
      id: z.string().uuid(),
    }).parseAsync,
  );

  if (
    false === (await isUserAllowedToCreateOrModifyColumns(user.id, boardId))
  ) {
    throw createError({
      status: 403,
      message: "You are not authorized to delete columns",
    });
  }

  const response = await deleteStatusColumn(boardId, columnId);

  if (!response) {
    throw createError({ status: 404, message: "Column not found" });
  }

  return sendNoContent(event, 204);
});
