import {
  queryOptions,
  type UndefinedInitialQueryOptions,
} from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { Workspace } from "~~/server/db/schema";

export const getWorkspaceOptions = (id: MaybeRefOrGetter<string>) =>
  queryOptions<Workspace>({
    queryKey: ["workspace", id],
  });

export const useWorkspace = <T extends UndefinedInitialQueryOptions>(
  id: MaybeRefOrGetter<string>,
  extraOptions: Partial<T> = {},
) => {
  const client = useQueryClient();

  return useQuery(
    {
      ...extraOptions,
      queryKey: getWorkspaceOptions(id).queryKey,
      queryFn: () =>
        useRequestFetch()(`/api/workspace/${toValue(id)}`).then((response) =>
          normalizeDates<Workspace>(response),
        ),
    },
    client,
  );
};
