import { createStatusColumnSchema, validateId } from "~/lib/validation";
import type { StatusColumn } from "~~/server/db/schema";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";
import { createStatusColumn } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { workspace: workspaceId } = await getValidatedRouterParams(
    event,
    validateId("workspace").parseAsync,
  );

  if (false === (await isUserWorkspaceCollaborator(user.id, workspaceId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to create a column in this workspace",
    });
  }

  const data = await readValidatedBody(event, createStatusColumnSchema.parse);
  const column = await createStatusColumn({
    ...data,
    userId: user.id,
    workspaceId,
  });

  return column as StatusColumn;
});
