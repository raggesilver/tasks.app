import { validateId } from "~/lib/validation";
import { deleteLabel } from "~/server/services/label";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  // FIXME: ensure user has permission to delete label
  const label = await deleteLabel(id);

  return sendNoContent(event, label ? 204 : 404);
});
