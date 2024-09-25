import { z } from "zod";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { getLabelsForWorkspace } from "~~/server/services/label";

const schema = z.object({
  workspaceId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const query = await getValidatedQuery(event, schema.parseAsync);

  if (
    false === (await isUserWorkspaceCollaborator(user.id, query.workspaceId))
  ) {
    throw createError({
      status: 403,
      message: "You are not authorized to view this workspace",
    });
  }

  return getLabelsForWorkspace(query.workspaceId);
});
