import { publicUserSchema } from "~/lib/validation";
import { getWorkspaceCollaborators } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const workspaceId = getRouterParam(event, "id")!;

  // TODO: verify that the user is a collaborator of the workspace

  return getWorkspaceCollaborators(workspaceId).then((users) =>
    publicUserSchema.array().parseAsync(users),
  );
});
