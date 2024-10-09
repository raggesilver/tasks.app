import { queryOptions } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { StatusColumn } from "~~/server/db/schema";

export const getStatusColumnOptions = (
  statusColumnId: MaybeRefOrGetter<string>,
) =>
  queryOptions<StatusColumn>({
    queryKey: ["status-column", statusColumnId],
  });

export const getBoardColumnsOptions = (boardId: MaybeRefOrGetter<string>) =>
  queryOptions<StatusColumn[]>({
    queryKey: ["board-columns", boardId],
  });

export const useStatusColumns = (boardId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getBoardColumnsOptions(boardId).queryKey,
      queryFn: () =>
        useRequestFetch()(`/api/column/${toValue(boardId)}`).then((columns) => {
          const normalized = normalizeDates<StatusColumn>(columns);

          for (const col of normalized) {
            client.setQueryData(getStatusColumnOptions(col.id).queryKey, col);
          }

          return normalized;
        }),
    },
    client,
  );
};

export const useStatusColumnMutation = (
  options: {
    onSuccess?: (column: StatusColumn) => void;
    onError?: (error: Error) => void;
  } = {},
) => {
  const client = useQueryClient();
  return useMutation(
    {
      mutationFn: ({
        col,
        newOrder,
      }: {
        col: StatusColumn;
        newOrder: number;
      }) =>
        useRequestFetch()<StatusColumn>(
          `/api/column/${col.boardId}/${col.id}`,
          {
            method: "PATCH",
            body: { order: newOrder },
          },
        ),
      onSuccess: async (column) => {
        // TODO: we are not doing optimistic updates here since it would require
        // reimplementing the update logic in the client. We should consider
        // returning all columns from the server.

        // TODO: We should invalidate individual column queries here as well

        // await client.setQueryData(["status-column", column.id], column);

        await client.invalidateQueries(getBoardColumnsOptions(column.boardId));

        await client.invalidateQueries(getBoardOptions(column.boardId));

        options.onSuccess?.(column);
      },
      onError: (error) => {
        options.onError?.(error);
      },
    },
    client,
  );
};

export const useDeleteStatusColumn = (
  options: {
    /**
     * @param column - The old column.
     */
    onSuccess?: (column: StatusColumn) => void;
    onError?: (error: Error) => void;
  } = {},
) => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: async (column: StatusColumn) =>
        await useRequestFetch()<null>(
          `/api/column/${column.boardId}/${column.id}`,
          { method: "DELETE" },
        ),
      onSuccess: async (_, column) => {
        // We need to invalidate all columns as their order might have changed.
        await client.invalidateQueries(getBoardColumnsOptions(column.boardId));

        client.removeQueries(getStatusColumnOptions(column.id));

        options.onSuccess?.(column);
      },
      onError: (error) => {
        options.onError?.(error);
      },
    },
    client,
  );
};
