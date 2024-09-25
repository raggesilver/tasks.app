import { z } from "zod";
import { updateWorkspaceLabelSchema } from "~/lib/validation";
import { updateLabel } from "~~/server/services/label";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({ id: z.string().uuid() }).parse,
  );
  const data = await readValidatedBody(event, updateWorkspaceLabelSchema.parse);

  const label = await updateLabel(params.id, data);

  return label;
});
