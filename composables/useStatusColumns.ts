import type { StatusColumn } from "~/server/db/schema";

export const useStatusColumns = (workspaceId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();
  const { ...rest } = useQuery(
    {
      queryKey: ["workspace-columns", workspaceId],
      queryFn: () =>
        // We need to use `useRequestFetch` instead of `fetch` because of a bug
        // in Nuxt that doesn't include cookies in SSR requests.
        //
        // https://github.com/Atinux/nuxt-auth-utils/issues/97#issuecomment-2150442690
        //https://github.com/nuxt/nuxt/issues/24813
        useRequestFetch()(`/api/column/${toValue(workspaceId)}`).then(
          (columns) => {
            const normalized = columns.map((column) => {
              const ret: StatusColumn = {
                ...column,
                // Date objects are not deserialized properly, so we need to
                // convert them back to Date objects.
                createdAt: new Date(column.createdAt),
                updatedAt: new Date(column.updatedAt),
              };

              // Cache each workspace in the query client so that navigating to
              // the workspace page doesn't need to fetch the workspace again.
              client.setQueryData<StatusColumn>(["status-column", ret.id], ret);
              return ret;
            });

            return normalized;
          },
        ),
    },
    client,
  );

  return {
    client,
    ...rest,
  };
};

export const useStatusColumnMutation = (
  options: {
    onSuccess?: (column: StatusColumn) => void;
    onError?: (error: Error) => void;
  } = {},
) => {
  const client = useQueryClient();
  const { mutateAsync } = useMutation(
    {
      mutationFn: ({
        col,
        newOrder,
      }: {
        col: StatusColumn;
        newOrder: number;
      }): Promise<StatusColumn | null> => {
        // @ts-ignore
        return $fetch(`/api/column/${col.workspaceId}/${col.id}`, {
          method: "PATCH",
          body: { order: newOrder },
        });
      },
      onSuccess: async (column: StatusColumn | null) => {
        if (!column) return;

        // TODO: we are not doing optimistic updates here since it would require
        // reimplementing the update logic in the client. We should consider
        // returning all columns from the server.

        // TODO: We should invalidate individual column queries here as well

        //await client.setQueryData(["status-column", column.id], column);

        await client.invalidateQueries({
          queryKey: ["workspace-columns", column.workspaceId],
        });

        await client.invalidateQueries({
          queryKey: ["workspace", column.workspaceId],
        });

        options.onSuccess?.(column);
      },
      onError: (error) => {
        options.onError?.(error);
      },
    },
    client,
  );

  return { mutateAsync };
};
