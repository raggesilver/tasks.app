import type { UpdateTaskInput } from "~/lib/validation";
import { type Task } from "~/server/db/schema";

export const useTasks = (
  workspaceId: MaybeRefOrGetter<string>,
  statusColumnId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  const { data, ...rest } = useQuery(
    {
      queryKey: ["status-column-tasks", statusColumnId],
      queryFn: () =>
        useRequestFetch()(
          `/api/column/${workspaceId}/${statusColumnId}/get-tasks`,
        ).then((res) =>
          res.map<Task>((task) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          })),
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

        client.setQueryData<Task[]>(
          ["status-column-tasks", updatedTask.statusColumnId],
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
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );

            return copy;
          },
        );

        if (task.statusColumnId !== updatedTask.statusColumnId) {
          client.setQueryData<Task[]>(
            ["status-column-tasks", task.statusColumnId],
            (tasks) => {
              if (!tasks) return;

              return tasks.filter((t) => t.id !== task.id);
            },
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
