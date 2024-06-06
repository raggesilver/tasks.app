<script lang="ts" setup>
import type { FetchError } from "ofetch";

definePageMeta({
  layout: "app",
});

const route = useRoute();
const id = computed(() => route.params.id.toString());

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
</script>

<template>
  <div class="flex flex-col flex-grow p-8 gap-8">
    <template v-if="data">
      <h1 class="text-3xl font-extrabold">{{ data.name }}</h1>
      <div class="flex-grow overflow-x-auto overflow-y-hidden min-w-full">
        <div class="flex flex-row gap-8 items-stretch">
          <StatusColumn v-for="column in columns" :key="column.id" :column />
          <span
            class="flex flex-col items-center justify-center p-8 border-2 rounded-lg border-dashed w-xs flex-shrink-0"
          >
            <CreateColumn />
          </span>
        </div>
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
