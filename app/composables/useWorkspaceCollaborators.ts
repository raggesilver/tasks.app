import { queryOptions } from "@tanstack/vue-query";
import type { WorkspaceCollaborator } from "~~/server/db/schema";

export const getWorkspaceCollaboratorsOptions = (
  workspaceId: MaybeRefOrGetter<string>,
) =>
  queryOptions<WorkspaceCollaborator[]>({
    queryKey: ["workspaceCollaborators", workspaceId],
  });

export const useWorkspaceCollaborators = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getWorkspaceCollaboratorsOptions(workspaceId).queryKey,
      queryFn: () =>
        useRequestFetch()(
          `/api/workspace/${toValue(workspaceId)}/collaborators`,
        ),
    },
    client,
  );
};
