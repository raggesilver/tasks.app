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
        useRequestFetch()<WorkspaceCollaborator[]>(
          `/api/workspace/${toValue(workspaceId)}/collaborators`,
        ),
    },
    client,
  );
};

export const useRemoveWorkspaceCollaborator = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: ({
        workspaceId,
        userId,
      }: {
        workspaceId: string;
        userId: string;
      }) =>
        useRequestFetch()(
          `/api/workspace/${workspaceId}/collaborator/${userId}`,
          {
            method: "DELETE",
          },
        ).then(() => ({ workspaceId, userId })),
      onSuccess: ({ workspaceId, userId }) => {
        client.setQueryData(
          getWorkspaceCollaboratorsOptions(workspaceId).queryKey,
          (collaborators) => collaborators?.filter((c) => c.userId !== userId),
        );
      },
    },
    client,
  );
};
