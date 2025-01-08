import { updateWorkspaceSchema, validateId } from "~/lib/validation";
import { isUserAllowedToModifyWorkspace } from "~~/server/services/authorization";
import { updateWorkspace } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (!(await isUserAllowedToModifyWorkspace(user.id, id))) {
    throw createError({
      status: 403,
      message: "You are not allowed to modify this workspace.",
    });
  }

  const data = await readValidatedBody(event, updateWorkspaceSchema.parseAsync);
  return await updateWorkspace(id, data);
});
