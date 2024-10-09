import { z } from "zod";
import { isUserBoardCollaborator } from "~~/server/services/authorization";
import { getLabelsForBoard } from "~~/server/services/label";

const schema = z.object({
  boardId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const query = await getValidatedQuery(event, schema.parseAsync);

  if (false === (await isUserBoardCollaborator(user.id, query.boardId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view this board",
    });
  }

  return getLabelsForBoard(query.boardId);
});
