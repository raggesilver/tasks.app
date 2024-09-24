import { z } from "zod";
import { removeLabelFromTask } from "~~/server/services/task";

const paramsSchema = z.object({
  id: z.string().uuid(),
  labelId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const { id, labelId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const result = await removeLabelFromTask(id, labelId);

  return result ? sendNoContent(event, 204) : sendNoContent(event, 404);
});
