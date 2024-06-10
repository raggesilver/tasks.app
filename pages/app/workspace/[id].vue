<script lang="ts" setup>
import type { FetchError } from "ofetch";

definePageMeta({
  layout: "app",
});

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id.toString());
const viewTask = computed<string | null>(
  () => route.query["view-task"]?.toString() ?? null,
);

const { data, error, suspense } = useWorkspace(id);
const { data: columns, suspense: statusSuspense } = useStatusColumns(id);

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

const onTaskClosed = () => {
  router.push({ query: { ...route.query, "view-task": undefined } });
};
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
  <TaskView v-if="viewTask" :taskId="viewTask" @close="onTaskClosed" />
</template>
