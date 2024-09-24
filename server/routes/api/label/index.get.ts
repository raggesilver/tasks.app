import { z } from "zod";
import { getLabelsForWorkspace } from "~~/server/services/label";

const schema = z.object({
  workspaceId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, schema.parse);

  const labels = await getLabelsForWorkspace(query.workspaceId);

  return labels;
});
