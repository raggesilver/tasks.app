import { queryOptions } from "@tanstack/vue-query";
import type { Plan } from "~~/server/db/schema";

export const getWorkspacePlanOptions = (
  workspaceId: MaybeRefOrGetter<string>,
) =>
  queryOptions<Plan | null>({
    queryKey: ["workspace", workspaceId, "plan"],
  });

export const useWorkspacePlan = (workspaceId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery<Plan | null>(
    {
      queryKey: getWorkspacePlanOptions(workspaceId).queryKey,
      queryFn: async () =>
        useRequestFetch()(`/api/workspace/${toValue(workspaceId)}/plan`).then(
          (response) => response.plan,
        ),
    },
    client,
  );
};
