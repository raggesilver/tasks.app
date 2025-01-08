import { queryOptions } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { Workspace } from "~~/server/db/schema";

export const getWorkspacesOptions = () =>
  queryOptions<Workspace[]>({
    queryKey: ["workspaces"],
  });

export const useWorkspaces = () => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getWorkspacesOptions().queryKey,
      queryFn: () =>
        useRequestFetch()("/api/workspace")
          .then((response) => normalizeDates<Workspace>(response))
          .then((workspaces) => {
            for (const workspace of workspaces) {
              client.setQueryData(
                getWorkspaceOptions(workspace.id).queryKey,
                workspace,
              );
            }

            return workspaces;
          }),
    },
    client,
  );
};
