import { getWorkspaceOptions, normalizeWorkspace } from "./useWorkspaces";

/**
 * Fetches a workspace by its ID.
 *
 * @param id The ID of the workspace to fetch.
 */
export const useWorkspace = (id: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getWorkspaceOptions(id).queryKey,
      queryFn: () =>
        // We need to use `useRequestFetch` instead of `fetch` because of a bug
        // in Nuxt that doesn't include cookies in SSR requests.
        useRequestFetch()(`/api/workspace/${toValue(id)}`).then((workspace) => {
          const normalized = normalizeWorkspace(workspace);

          client.setQueryData(getWorkspacesOptions().queryKey, (workspaces) => {
            // Update this workspace in the workspaces cache if it exists.
            if (workspaces) {
              const index = workspaces.findIndex((w) => w.id === normalized.id);
              if (index !== -1) {
                return workspaces.map((w) =>
                  w.id === normalized.id ? normalized : w,
                );
              } else {
                return [...workspaces, normalized];
              }
            }
          });

          return normalized;
        }),
    },
    client,
  );
};
