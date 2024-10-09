import { z } from "zod";
import { isUserAllowedToEditBoard } from "~~/server/services/authorization";
import { _getBoardById, addCollaboratorById } from "~~/server/services/board";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id, collaborator: collaboratorId } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string().uuid(),
      collaborator: z.string().uuid(),
    }).parse,
  );

  const board = await _getBoardById(id);

  if (!board) {
    throw createError({ status: 404, message: "Board not found" });
  }

  if (false === (await isUserAllowedToEditBoard(user, board))) {
    throw createError({
      status: 403,
      message: "You are not allowed to edit this board",
    });
  }

  const result = await addCollaboratorById(id, collaboratorId);

  if (!result) {
    // We're not sure exactly what went wrong here, so we'll just return a
    // generic error
    throw createError({
      status: 400,
      message: "Failed to add collaborator to board",
    });
  }

  return "OK";
});
