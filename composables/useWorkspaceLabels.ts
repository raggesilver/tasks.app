import type { QueryClient } from "@tanstack/vue-query";
import type { SerializeObject } from "nitropack";
import type { CreateWorkspaceLabelInput } from "~/lib/validation";
import type { Label, TaskWithEverything } from "~/server/db/schema";

const setLabelData = (
  client: QueryClient,
  label: Label,
  action = "update-both" as "label" | "workspace" | "update-both" | "add",
) => {
  if (action === "label" || action === "update-both" || action === "add") {
    client.setQueryData<Label>(["label", label.id], label);
  }

  if (action === "workspace" || action === "update-both") {
    client.setQueryData<Label[]>(
      ["workspace-labels", label.workspaceId],
      (oldLabels: Label[] | undefined) => {
        if (!oldLabels) {
          return [label];
        }
        return oldLabels.map((oldLabel) =>
          oldLabel.id === label.id ? label : oldLabel,
        );
      },
    );
  }

  if (action === "add") {
    client.setQueryData<Label[]>(
      ["workspace-labels", label.workspaceId],
      (oldLabels: Label[] | undefined) =>
        oldLabels ? [...oldLabels, label] : [label],
    );
  }
};

const removeLabelData = (
  client: QueryClient,
  labelId: string,
  workspaceId: string,
) => {
  client.removeQueries({ queryKey: ["label", labelId] });

  client.setQueryData<Label[]>(["workspace-labels", workspaceId], (oldLabels) =>
    oldLabels?.filter((label) => label.id !== labelId),
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

const normalizeLabel = (label: SerializeObject<Label>) => {
  return {
    ...label,
    createdAt: new Date(label.createdAt),
    updatedAt: new Date(label.updatedAt),
  };
};

export const useWorkspaceLabels = (workspaceId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  const { ...rest } = useQuery<Label[]>(
    {
      queryKey: ["workspace-labels", workspaceId],
      queryFn: async () =>
        useRequestFetch()(`/api/label`, {
          query: {
            workspaceId: toValue(workspaceId),
          },
        }).then((labels) => {
          const normalizedLabels = labels.map(normalizeLabel);
          normalizedLabels.forEach((label) =>
            setLabelData(client, label, "label"),
          );
          return normalizedLabels;
        }),
    },
    client,
  );

  return { ...rest, client };
};

export const useWorkspaceLabel = (labelId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  const { ...rest } = useQuery<Label>(
    {
      queryKey: ["label", labelId],
      queryFn: async () =>
        useRequestFetch()(`/api/label/${toValue(labelId)}`).then((label) => {
          const normalizedLabel = normalizeLabel(label);

          setLabelData(client, normalizedLabel, "label");

          return normalizedLabel;
        }),
    },
    client,
  );

  return { ...rest, client };
};

export const useCreateLabel = () => {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateWorkspaceLabelInput) =>
      useRequestFetch()("/api/label", {
        method: "POST",
        body: data,
      }).then((label) => {
        const normalizedLabel = normalizeLabel(label);

        setLabelData(client, normalizedLabel, "add");

        return normalizedLabel;
      }),
  });

  return { ...mutation, client };
};

export const useUpdateLabel = () => {
  const client = useQueryClient();

  const mutation = useMutation({
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
        const normalizedLabel = normalizeLabel(label);

        setLabelData(client, normalizedLabel);

        return normalizedLabel;
      }),
  });

  return { ...mutation, client };
};

export const useDeleteLabel = () => {
  const client = useQueryClient();

  const mutation = useMutation({
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

  return { ...mutation, client };
};
