import { createBoardLabelSchema } from "~/lib/validation";
import { isUserBoardCollaborator } from "~~/server/services/authorization";
import { createLabel } from "~~/server/services/label";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const data = await readValidatedBody(
    event,
    createBoardLabelSchema.parseAsync,
  );

  if (false === (await isUserBoardCollaborator(user.id, data.boardId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to modify this board",
    });
  }

  return createLabel(data);
});
