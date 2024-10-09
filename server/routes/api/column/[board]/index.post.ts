import { createStatusColumnSchema, validateId } from "~/lib/validation";
import type { StatusColumn } from "~~/server/db/schema";
import { isUserBoardCollaborator } from "~~/server/services/authorization";
import { createStatusColumn } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { board: boardId } = await getValidatedRouterParams(
    event,
    validateId("board").parseAsync,
  );

  if (false === (await isUserBoardCollaborator(user.id, boardId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to create a column in this board",
    });
  }

  const data = await readValidatedBody(event, createStatusColumnSchema.parse);
  const column = await createStatusColumn({
    ...data,
    userId: user.id,
    boardId,
  });

  return column as StatusColumn;
});
