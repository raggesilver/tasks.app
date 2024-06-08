<script lang="ts" setup>
import type { FetchError } from "ofetch";
import { toast } from "vue-sonner";
import type { StatusColumn } from "~/server/db/schema";

definePageMeta({
  layout: "app",
});

const route = useRoute();
const id = computed(() => route.params.id.toString());

const { data, error, suspense } = useWorkspace(id);
const { data: columns, suspense: statusSuspense } = useStatusColumns(id);

const client = useQueryClient();
const { mutateAsync } = useMutation(
  {
    mutationFn: ({
      col,
      newOrder,
    }: {
      col: StatusColumn;
      newOrder: number;
    }): Promise<StatusColumn | null> => {
      // @ts-ignore
      return $fetch(`/api/column/${col.workspaceId}/${col.id}`, {
        method: "PATCH",
        body: { order: newOrder },
      });
    },
    onSuccess: async (column) => {
      if (!column) return;

      await client.invalidateQueries({
        queryKey: ["workspace-columns", id.value],
      });

      await client.invalidateQueries({
        queryKey: ["workspace", id.value],
      });

      // TODO: we are not doing optimistic updates here since it would require
      // reimplementing the update logic in the client. We should consider
      // returning all columns from the server.

      // TODO: We should invalidate individual column queries here as well
    },
    onError: () => {
      toast.error("Failed to update column order");
    },
  },
  client,
);

await Promise.all([suspense(), statusSuspense()]);

const typedError = computed(
  () =>
    (error.value as FetchError | undefined)?.data as
      | { message: string; statusCode: number }
      | undefined,
);

const is404 = computed(() => typedError.value?.statusCode === 404);

const title = computed(() => data.value?.name ?? "Workspace");

useHead({
  title,
});
</script>

<template>
  <div class="flex flex-col flex-grow px-8 pt-8 gap-8">
    <template v-if="data">
      <h1 class="text-3xl font-extrabold">{{ data.name }}</h1>
      <div
        class="flex-grow flex flex-row items-start gap-8 overflow-x-auto overflow-y-hidden min-w-full -mx-8 px-8 pb-8"
      >
        <div
          v-if="columns?.length"
          class="flex flex-row gap-8 items-stretch"
          ref="boardRef"
          @drop="onDrop"
        >
          <StatusColumn
            v-for="column in columns"
            :key="column.id"
            :column
            class="status-column"
          />
        </div>
        <span
          class="flex flex-col items-center justify-center p-8 border-2 rounded-lg border-dashed w-xs flex-shrink-0"
        >
          <CreateColumn />
        </span>
      </div>
    </template>
    <template v-else-if="is404" class="">
      <div class="flex-1 flex flex-col items-center justify-center">
        <h1 class="text-3xl font-extrabold">Workspace not found</h1>
        <Button variant="link" as-child>
          <NuxtLink to="/app">Go back</NuxtLink>
        </Button>
      </div>
    </template>
  </div>
</template>
