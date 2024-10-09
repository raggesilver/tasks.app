import { queryOptions } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { TaskWithEverything } from "~~/server/db/schema";
import { getTaskOptions } from "./useTask";

export const getStatusColumnTasksOptions = (
  statusColumnId: MaybeRefOrGetter<string>,
) =>
  queryOptions<TaskWithEverything[]>({
    queryKey: ["status-column-tasks", statusColumnId],
  });

export const useTasks = (
  boardId: MaybeRefOrGetter<string>,
  statusColumnId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getStatusColumnTasksOptions(statusColumnId).queryKey,
      queryFn: () =>
        useRequestFetch()(
          `/api/column/${boardId}/${statusColumnId}/get-tasks`,
        ).then((res) =>
          res.map((task) => {
            const normalized = normalizeDates(task);

            client.setQueryData(
              getTaskOptions(normalized.id).queryKey,
              normalized,
            );

            return normalized;
          }),
        ),
    },
    client,
  );
};
