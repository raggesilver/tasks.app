import { z } from "zod";
import { isUserBoardCollaboratorForLabel } from "~~/server/services/authorization";
import { getLabelById } from "~~/server/services/label";

const schema = z.object({
  id: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, schema.parseAsync);

  if (false === (await isUserBoardCollaboratorForLabel(user.id, id))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view this label",
    });
  }

  const label = await getLabelById(id);

  if (!label) {
    throw createError({ status: 404, message: "Label not found" });
  }

  return label;
});
