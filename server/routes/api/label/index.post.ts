import { createWorkspaceLabelSchema } from "~/lib/validation";
import { createLabel } from "~~/server/services/label";

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, createWorkspaceLabelSchema.parse);

  const label = await createLabel(data);

  return label;
});
