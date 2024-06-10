import type { UpdateTaskInput } from "~/lib/validation";
import { type Task } from "~/server/db/schema";

export const useTask = (taskId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  const { data, ...rest } = useQuery(
    {
      queryKey: ["task", taskId],
      queryFn: () =>
        useRequestFetch()(`/api/task/${toValue(taskId)}`).then(
          (task) =>
            ({
              ...task,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
            }) as Task,
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

        // We do not insert or update the task in the status-column-tasks query
        // here as we'd need to implement too much logic to find the old/new
        // status column, update, and sort the tasks.

        if (task.statusColumnId !== updatedTask.statusColumnId) {
          client.invalidateQueries({
            queryKey: ["status-column-tasks", task.statusColumnId],
          });
        }

        client.invalidateQueries({
          queryKey: ["status-column-tasks", updatedTask.statusColumnId],
        });

        client.setQueryData(["task", task.id], normalized);

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
