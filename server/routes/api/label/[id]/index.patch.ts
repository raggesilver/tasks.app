import { updateWorkspaceLabelSchema, validateId } from "~/lib/validation";
import { isUserAllowedToModifyLabel } from "~~/server/services/authorization";
import { updateLabel } from "~~/server/services/label";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: labelId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserAllowedToModifyLabel(user.id, labelId))) {
    throw createError({
      status: 403,
      message: "You are not allowed to modify this workspace",
    });
  }

  const data = await readValidatedBody(
    event,
    updateWorkspaceLabelSchema.parseAsync,
  );

  return updateLabel(labelId, data);
});
