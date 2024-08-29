import { removeCollaboratorById } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const id = getRouterParam(event, "id")!;
  const collaboratorId = getRouterParam(event, "collaborator")!;

  const result = await removeCollaboratorById(id, collaboratorId);

  if (!result) {
    // We're not sure exactly what went wrong here, so we'll just return a
    // generic error
    throw createError({
      status: 400,
      message: "Failed to remove collaborator from workspace",
    });
  }

  return sendNoContent(event, 204);
});
