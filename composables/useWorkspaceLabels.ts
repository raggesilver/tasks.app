import { queryOptions, type QueryClient } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { CreateWorkspaceLabelInput } from "~/lib/validation";
import type { Label, TaskWithEverything } from "~/server/db/schema";

export const getLabelOptions = (labelId: MaybeRefOrGetter<string>) =>
  queryOptions<Label>({
    queryKey: ["label", labelId],
  });

export const getWorkspaceLabelsOptions = (
  workspaceId: MaybeRefOrGetter<string>,
) =>
  queryOptions<Label[]>({
    queryKey: ["workspace-labels", workspaceId],
  });

const setLabelData = (
  client: QueryClient,
  label: Label,
  action = "update-both" as "label" | "workspace" | "update-both" | "add",
) => {
  if (action === "label" || action === "update-both" || action === "add") {
    client.setQueryData(getLabelOptions(label.id).queryKey, label);
  }

  if (action === "workspace" || action === "update-both") {
    client.setQueryData(
      getWorkspaceLabelsOptions(label.workspaceId).queryKey,
      (oldLabels) =>
        oldLabels?.map((old) => (old.id === label.id ? label : old)),
    );
  }

  if (action === "add") {
    client.setQueryData(
      getWorkspaceLabelsOptions(label.workspaceId).queryKey,
      (oldLabels) => (oldLabels ? [...oldLabels, label] : [label]),
    );
  }
};

const removeLabelData = (
  client: QueryClient,
  labelId: string,
  workspaceId: string,
) => {
  client.removeQueries(getLabelOptions(labelId));

  client.setQueryData(
    getWorkspaceLabelsOptions(workspaceId).queryKey,
    (oldLabels) => oldLabels?.filter((label) => label.id !== labelId),
  );

  const tasksToUpdate: string[] = [];

  client.setQueriesData<TaskWithEverything>(
    {
      queryKey: ["task"],
    },
    (task) => {
      return task
        ? {
            ...task,
            labels: task.labels.filter((label) => {
              const foundLabel = label.labelId === labelId;

              if (foundLabel) {
                tasksToUpdate.push(task.id);
              }

              return !foundLabel;
            }),
          }
        : task;
    },
  );

  client.setQueriesData<TaskWithEverything[]>(
    {
      queryKey: ["status-column-tasks"],
    },
    (tasks) => {
      return tasks?.map((task) => {
        if (tasksToUpdate.includes(task.id)) {
          return {
            ...task,
            labels: task.labels.filter((label) => label.labelId !== labelId),
          };
        }

        return task;
      });
    },
  );
};

export const useWorkspaceLabels = (workspaceId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getWorkspaceLabelsOptions(workspaceId).queryKey,
      queryFn: async () =>
        useRequestFetch()(`/api/label`, {
          query: {
            workspaceId: toValue(workspaceId),
          },
        }).then((labels) => {
          const normalizedLabels = labels.map<Label>(normalizeDates);
          normalizedLabels.forEach((label) =>
            setLabelData(client, label, "label"),
          );
          return normalizedLabels;
        }),
    },
    client,
  );
};

export const useWorkspaceLabel = (labelId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery<Label>(
    {
      queryKey: getLabelOptions(labelId).queryKey,
      queryFn: async () =>
        useRequestFetch()(`/api/label/${toValue(labelId)}`).then((label) => {
          const normalizedLabel = normalizeDates<Label>(label);

          setLabelData(client, normalizedLabel, "label");

          return normalizedLabel;
        }),
    },
    client,
  );
};

export const useCreateLabel = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkspaceLabelInput) =>
      useRequestFetch()("/api/label", {
        method: "POST",
        body: data,
      }).then((label) => {
        const normalizedLabel = normalizeDates<Label>(label);

        setLabelData(client, normalizedLabel, "add");

        return normalizedLabel;
      }),
  });
};

export const useUpdateLabel = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      labelId,
    }: {
      data: CreateWorkspaceLabelInput;
      labelId: string;
    }) =>
      useRequestFetch()(`/api/label/${labelId}`, {
        method: "PATCH",
        body: data,
      }).then((label) => {
        const normalizedLabel = normalizeDates<Label>(label);

        setLabelData(client, normalizedLabel);

        return normalizedLabel;
      }),
  });
};

export const useDeleteLabel = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({
      labelId,
      workspaceId,
    }: {
      labelId: string;
      workspaceId: string;
    }) =>
      useRequestFetch()(`/api/label/${labelId}`, {
        method: "DELETE",
      }).then(() => {
        removeLabelData(client, labelId, workspaceId);
      }),
  });
};
