<script lang="ts" setup>
import type { FetchError } from "ofetch";

definePageMeta({
  layout: "app",
});

const route = useRoute();
const id = computed(() => route.params.id);

const client = useQueryClient();
const { data, error } = useQuery(
  {
    queryKey: ["workspace", id],
    queryFn: () => $fetch(`/api/workspace/${id.value}`),
  },
  client,
);

const typedError = computed(
  () =>
    (error.value as FetchError | undefined)?.data as
      | { message: string; statusCode: number }
      | undefined,
);

const is404 = computed(() => typedError.value?.statusCode === 404);
</script>

<template>
  <div class="flex flex-col flex-grow p-8">
    <template v-if="data">
      <h1 class="text-3xl font-extrabold">{{ data.name }}</h1>
      <pre>{{ data }}</pre>
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
