import { queryOptions, useMutation } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { UpdateTaskInput } from "~/lib/validation";
import type { Task, TaskWithEverything } from "~/server/db/schema";
import { getTaskOptions } from "./useTask";

export const getStatusColumnTasksOptions = (
  statusColumnId: MaybeRefOrGetter<string>,
) =>
  queryOptions<TaskWithEverything[]>({
    queryKey: ["status-column-tasks", statusColumnId],
  });

export const useTasks = (
  workspaceId: MaybeRefOrGetter<string>,
  statusColumnId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getStatusColumnTasksOptions(statusColumnId).queryKey,
      queryFn: () =>
        useRequestFetch()(
          `/api/column/${workspaceId}/${statusColumnId}/get-tasks`,
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

export const useTaskMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ task, data }: { task: Task; data: UpdateTaskInput }) =>
      useRequestFetch()(`/api/task/${task.id}`, {
        method: "PATCH",
        body: data,
      }).then((updatedTask) => {
        const normalized = normalizeDates<TaskWithEverything>(updatedTask);

        client.setQueryData(
          getStatusColumnTasksOptions(updatedTask.statusColumnId).queryKey,
          (tasks) => {
            if (!tasks) return;

            const copy = [...tasks];
            const index = copy.findIndex((t) => t.id === updatedTask.id);
            if (index === -1) {
              copy.push(normalized);
            } else {
              Object.assign(copy[index], normalized);
            }
            copy.sort(
              (a, b) =>
                new Date(b.updatedAt ?? b.createdAt).getTime() -
                new Date(a.updatedAt ?? a.createdAt).getTime(),
            );

            return copy;
          },
        );

        client.setQueryData(
          getTaskOptions(updatedTask.id).queryKey,
          normalized,
        );

        if (task.statusColumnId !== updatedTask.statusColumnId) {
          client.setQueryData(
            getStatusColumnTasksOptions(task.statusColumnId).queryKey,
            (tasks) => tasks?.filter((t) => t.id !== task.id),
          );
        }

        return normalized;
      }),
  });
};
