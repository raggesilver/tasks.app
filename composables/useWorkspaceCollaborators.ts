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
