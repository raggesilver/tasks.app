import type { Workspace } from "~/server/db/schema";

/**
 * useWorkspace is a Vue hook that fetches a workspace by its ID.
 *
 * @param id The ID of the workspace to fetch. Pass a reactive ref or a getter
 * to have this hook reactively update when the ID changes.
 */
export const useWorkspace = (id: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: ["workspace", id],
      queryFn: () =>
        // We need to use `useRequestFetch` instead of `fetch` because of a bug
        // in Nuxt that doesn't include cookies in SSR requests.
        useRequestFetch()(`/api/workspace/${toValue(id)}`).then((workspace) => {
          const ret: Workspace = {
            ...workspace,
            // Date objects are not deserialized properly, so we need to
            // convert them back to Date objects.
            createdAt: new Date(workspace.createdAt),
            updatedAt: new Date(workspace.updatedAt),
          };

          client.setQueryData<Workspace[]>(["workspaces"], (workspaces) => {
            // Update this workspace in the workspaces cache if it exists.
            if (workspaces) {
              const index = workspaces.findIndex((w) => w.id === ret.id);
              if (index !== -1) {
                return workspaces.map((w) => (w.id === ret.id ? ret : w));
              } else {
                return [...workspaces, ret];
              }
            }
          });

          return ret;
        }),
    },
    client,
  );
};
