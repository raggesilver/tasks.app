import { z } from "zod";
import { getLabelById } from "~/server/services/label";

const schema = z.object({
  id: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, schema.parse);

  const label = await getLabelById(id);

  if (!label) {
    throw createError({ status: 404, message: "Label not found" });
  }

  return label;
});
