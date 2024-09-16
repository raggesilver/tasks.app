import type { UpdateTaskInput } from "~/lib/validation";
import type {
  Task,
  TaskWithAssignees,
  TaskWithEverything,
} from "~/server/db/schema";

const normalizeTask = <T extends { createdAt: string; updatedAt: string }>(
  task: T,
): T & { createdAt: Date; updatedAt: Date } => ({
  ...task,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
});

// const setTaskData = (
//   client: QueryClient,
//   task: TaskWithEverything,
//   action = "update-both" as "task" | "status" | "update-both" | "add",
// ) => {
//   if (action === "task" || action === "update-both" || action === "add") {
//     client.setQueryData<TaskWithEverything>(["task", task.id], task);
//   }
//
//   if (action === "status" || action === "update-both") {
//     client.setQueryData<TaskWithEverything[]>(
//       ["status-column-tasks", task.statusColumnId],
//       (oldTasks: TaskWithEverything[] | undefined) => {
//         if (!oldTasks) {
//           return [task];
//         }
//         return oldTasks.map((oldTask) =>
//           oldTask.id === task.id ? task : oldTask,
//         );
//       },
//     );
//   }
//
//   if (action === "add") {
//     client.setQueryData<TaskWithEverything[]>(
//       ["status-column-tasks", task.statusColumnId],
//       (oldTasks: TaskWithEverything[] | undefined) =>
//         oldTasks ? [...oldTasks, task] : [task],
//     );
//   }
// };

export const useTask = (taskId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  const { data, ...rest } = useQuery<TaskWithEverything>(
    {
      queryKey: ["task", taskId],
      queryFn: () =>
        useRequestFetch()(`/api/task/${toValue(taskId)}`).then((task) =>
          normalizeTask(task),
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
        const normalized = normalizeTask(updatedTask);

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

  const {
    mutateAsync: deleteTask,
    error: deletionError,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (task: Task) =>
      // @ts-ignore
      useRequestFetch()(`/api/task/${task.id}`, { method: "DELETE" }),
    onSuccess: (_, task: Task) => {
      // Remove individual task query
      client.removeQueries({
        queryKey: ["task", task.id],
      });
      // Remove task from it's status column
      client.setQueryData(
        ["status-column-tasks", task.statusColumnId],
        (tasks: Task[]) => tasks?.filter((t) => t.id !== task.id),
      );
    },
  });

  return {
    data,
    mutate,
    mutationError,
    deleteTask,
    deletionError,
    isDeleting,
    ...rest,
  };
};

export const useTaskAddAssigneeMutation = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
        useRequestFetch()(`/api/task/${taskId}/assignee`, {
          method: "POST",
          body: {
            userId,
          },
        }),
      onSuccess: (response, { taskId }) => {
        if (!response) return;

        const statusColumnId = client.getQueryData<TaskWithAssignees>([
          "task",
          taskId,
        ])?.statusColumnId;

        client.invalidateQueries({
          queryKey: ["task", taskId],
        });

        if (statusColumnId) {
          client.invalidateQueries({
            queryKey: ["status-column-tasks", statusColumnId],
          });
        }
      },
    },
    client,
  );
};

export const useTaskRemoveAssigneeMutation = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
        useRequestFetch()(`/api/task/${taskId}/assignee/${userId}`, {
          method: "DELETE",
        }),
      onSuccess: (_, { taskId }) => {
        const statusColumnId = client.getQueryData<TaskWithAssignees>([
          "task",
          taskId,
        ])?.statusColumnId;

        client.invalidateQueries({
          queryKey: ["task", taskId],
        });

        if (statusColumnId) {
          client.invalidateQueries({
            queryKey: ["status-column-tasks", statusColumnId],
          });
        }
      },
    },
    client,
  );
};

export const useTaskAddLabelMutation = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
        useRequestFetch()(`/api/task/${taskId}/label`, {
          method: "POST",
          body: {
            labelId,
          },
        }),
      onSuccess: (_, { taskId, labelId }) => {
        let statusColumnId: string | undefined;
        client.setQueryData(
          ["task", taskId],
          (task: TaskWithEverything | undefined) => {
            if (!task?.labels) return task;

            statusColumnId = task.statusColumnId;

            return {
              ...task,
              labels: [...task.labels, { labelId, taskId }],
            };
          },
        );

        if (statusColumnId) {
          client.setQueryData(
            ["status-column-tasks", statusColumnId],
            (tasks: TaskWithEverything[] | undefined) =>
              tasks?.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      labels: [...task.labels, { labelId, taskId }],
                    }
                  : task,
              ),
          );
        }
      },
    },
    client,
  );
};

export const useTaskRemoveLabelMutation = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
        useRequestFetch()(`/api/task/${taskId}/label/${labelId}`, {
          method: "DELETE",
        }),
      onSuccess: (_, { taskId, labelId }) => {
        let statusColumnId: string | undefined;
        client.setQueryData(
          ["task", taskId],
          (task: TaskWithEverything | undefined) => {
            if (!task?.labels) return task;

            statusColumnId = task.statusColumnId;

            return {
              ...task,
              labels: task.labels.filter((label) => label.labelId !== labelId),
            };
          },
        );

        client.setQueryData(
          ["status-column-tasks", statusColumnId],
          (tasks: TaskWithEverything[] | undefined) =>
            tasks?.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    labels: task.labels.filter(
                      (label) => label.labelId !== labelId,
                    ),
                  }
                : task,
            ),
        );
      },
    },
    client,
  );
};
