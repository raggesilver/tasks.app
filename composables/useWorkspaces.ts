import { queryOptions } from "@tanstack/vue-query";
import type { SerializeObject } from "nitropack";
import type { Workspace } from "~/server/db/schema";

export const getWorkspacesOptions = () =>
  queryOptions<Workspace[]>({
    queryKey: ["workspaces"],
  });

export const getWorkspaceOptions = (id: MaybeRefOrGetter<string>) =>
  queryOptions<Workspace>({
    queryKey: ["workspace", id],
  });

export const normalizeWorkspace = (
  workspace: SerializeObject<Workspace>,
): Workspace => ({
  ...workspace,
  createdAt: new Date(workspace.createdAt),
  updatedAt: new Date(workspace.updatedAt),
});

/**
 * Fetches all workspaces.
 *
 * This also sets up the cache for each workspace.
 */
export const useWorkspaces = () => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getWorkspacesOptions().queryKey,
      queryFn: () =>
        // We need to use `useRequestFetch` instead of `fetch` because of a bug
        // in Nuxt that doesn't include cookies in SSR requests.
        //
        // https://github.com/Atinux/nuxt-auth-utils/issues/97#issuecomment-2150442690
        //https://github.com/nuxt/nuxt/issues/24813
        useRequestFetch()("/api/workspace").then((workspaces) =>
          workspaces.map((workspace) => {
            const normalized = normalizeWorkspace(workspace);

            client.setQueryData(
              getWorkspaceOptions(normalized.id).queryKey,
              normalized,
            );

            return normalized;
          }),
        ),
    },
    client,
  );
};
