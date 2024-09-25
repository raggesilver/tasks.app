import { addCollaboratorById } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const id = getRouterParam(event, "id")!;
  const collaboratorId = getRouterParam(event, "collaborator")!;

  const result = await addCollaboratorById(id, collaboratorId);

  if (!result) {
    // We're not sure exactly what went wrong here, so we'll just return a
    // generic error
    throw createError({
      status: 400,
      message: "Failed to add collaborator to workspace",
    });
  }

  return "OK";
});
