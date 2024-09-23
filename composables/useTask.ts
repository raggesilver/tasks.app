import { queryOptions } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { UpdateTaskInput } from "~/lib/validation";
import type { Assignee, Task, TaskWithEverything } from "~/server/db/schema";

export const getTaskOptions = (id: MaybeRefOrGetter<string>) =>
  queryOptions<TaskWithEverything>({
    queryKey: ["task", id],
  });

export const useTask = (
  taskId: MaybeRefOrGetter<string>,
  options: { enabled?: MaybeRefOrGetter<boolean> } = {},
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getTaskOptions(taskId).queryKey,
      queryFn: () =>
        useRequestFetch()(`/api/task/${toValue(taskId)}`).then((task) =>
          normalizeDates<TaskWithEverything>(task),
        ),
      ...options,
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

        // We do not insert or update the task in the status-column-tasks query
        // here as we'd need to implement too much logic to find the old/new
        // status column, update, and sort the tasks.

        if (task.statusColumnId !== updatedTask.statusColumnId) {
          client.invalidateQueries(
            getStatusColumnTasksOptions(task.statusColumnId),
          );
        }

        client.invalidateQueries(
          getStatusColumnTasksOptions(updatedTask.statusColumnId),
        );

        client.setQueryData(getTaskOptions(task.id).queryKey, normalized);

        return normalized;
      }),
  });
};

export const useDeleteTaskMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) =>
      useRequestFetch()<null>(`/api/task/${task.id}`, { method: "DELETE" }),
    onSuccess: (_, task: Task) => {
      // Remove individual task query
      client.removeQueries(getTaskOptions(task.id));
      // Remove task from it's status column
      client.setQueryData(
        getStatusColumnTasksOptions(task.statusColumnId).queryKey,
        (tasks) => tasks?.filter((t) => t.id !== task.id),
      );
    },
  });
};

export const useTaskAddAssigneeMutation = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
        useRequestFetch()<Assignee | null>(`/api/task/${taskId}/assignee`, {
          method: "POST",
          body: {
            userId,
          },
        }),
      onSuccess: (response, { taskId }) => {
        if (!response) return;

        const statusColumnId = client.getQueryData(
          getTaskOptions(taskId).queryKey,
        )?.statusColumnId;

        client.invalidateQueries(getTaskOptions(taskId));

        if (statusColumnId) {
          client.invalidateQueries(getStatusColumnTasksOptions(statusColumnId));
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
        useRequestFetch()<null>(`/api/task/${taskId}/assignee/${userId}`, {
          method: "DELETE",
        }),
      onSuccess: (_, { taskId }) => {
        const statusColumnId = client.getQueryData(
          getTaskOptions(taskId).queryKey,
        )?.statusColumnId;

        client.invalidateQueries(getTaskOptions(taskId));

        if (statusColumnId) {
          client.invalidateQueries(getStatusColumnTasksOptions(statusColumnId));
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
        useRequestFetch()<null>(`/api/task/${taskId}/label`, {
          method: "POST",
          body: {
            labelId,
          },
        }),
      onSuccess: (_, { taskId, labelId }) => {
        let statusColumnId: string | undefined;
        client.setQueryData(getTaskOptions(taskId).queryKey, (task) => {
          if (!task?.labels) return task;

          statusColumnId = task.statusColumnId;

          return {
            ...task,
            labels: [...task.labels, { labelId, taskId }],
          };
        });

        if (statusColumnId) {
          client.setQueryData(
            getStatusColumnTasksOptions(statusColumnId).queryKey,
            (tasks) =>
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
        useRequestFetch()<null>(`/api/task/${taskId}/label/${labelId}`, {
          method: "DELETE",
        }),
      onSuccess: (_, { taskId, labelId }) => {
        let statusColumnId: string | undefined;
        client.setQueryData(getTaskOptions(taskId).queryKey, (task) => {
          if (!task?.labels) return task;

          statusColumnId = task.statusColumnId;

          return {
            ...task,
            labels: task.labels.filter((label) => label.labelId !== labelId),
          };
        });

        if (!statusColumnId) return;

        client.setQueryData(
          getStatusColumnTasksOptions(statusColumnId).queryKey,
          (tasks) =>
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
