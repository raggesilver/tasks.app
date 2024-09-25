import { validateId } from "~/lib/validation";
import { isUserAllowedToModifyLabel } from "~~/server/services/authorization";
import { deleteLabel } from "~~/server/services/label";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id: labelId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserAllowedToModifyLabel(user.id, labelId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to delete this label",
    });
  }

  // FIXME: ensure user has permission to delete label
  const label = await deleteLabel(labelId);

  return sendNoContent(event, label ? 204 : 404);
});
