import type { Task } from "~/server/db/schema";

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

  return {
    data,
    ...rest,
  };
};
