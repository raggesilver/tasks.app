import type { User } from "~/server/db/schema";

export const useWorkspaceCollaborators = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: ["workspace-collaborators", workspaceId],
      queryFn: () =>
        useRequestFetch()(
          `/api/workspace/${toValue(workspaceId)}/collaborators`,
        ).then((users) => users as User[]),
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
        ).then(() => {
          // Remove the user from the workspace collaborators cache.
          client.setQueryData(
            ["workspace-collaborators", workspaceId],
            (users: User[]) =>
              users?.filter((user) => user.id !== userId) ?? [],
          );
        }),
    },
    client,
  );
};
