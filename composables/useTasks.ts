import { queryOptions } from "@tanstack/vue-query";
import type { UpdateTaskInput } from "~/lib/validation";
import type { Task, TaskWithEverything } from "~/server/db/schema";

export const getTaskOptions = (taskId: MaybeRefOrGetter<string>) =>
  queryOptions<TaskWithEverything>({
    queryKey: ["task", taskId],
  });

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

  const { data, ...rest } = useQuery(
    {
      queryKey: getStatusColumnTasksOptions(statusColumnId).queryKey,
      queryFn: () =>
        useRequestFetch()(
          `/api/column/${workspaceId}/${statusColumnId}/get-tasks`,
        ).then((res) =>
          res.map((task) => {
            const normalized = {
              ...task,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
            };
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

  const { mutateAsync: mutate, error: mutationError } = useMutation({
    mutationFn: ({
      task,
      data,
    }: {
      task: Task;
      data: UpdateTaskInput;
    }): Promise<Task> =>
      // @ts-ignore
      useRequestFetch()(`/api/task/${task.id}`, {
        method: "PATCH",
        body: data,
      }).then((updatedTask) => {
        const normalized = {
          ...updatedTask,
          createdAt: new Date(updatedTask.createdAt),
          updatedAt: new Date(updatedTask.updatedAt),
        };

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
            // We might be able to simplify this by just moving the updated
            // task to the first position of the array. This is because it
            // is extremely likely that it will be the most recently updated
            // task. This would also remove the need to sort the array.
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

  return {
    data,
    mutate,
    mutationError,
    ...rest,
  };
};
