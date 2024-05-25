<script lang="ts" setup>
definePageMeta({
  layout: "app",
});

const route = useRoute();
const id = computed(() => route.params.id);

const client = useQueryClient();
const { data, isLoading } = useQuery(
  {
    queryKey: ["workspace", id],
    queryFn: () => $fetch(`/workspace/${id.value}`),
  },
  client,
);
</script>

<template>
  <div v-if="data" class="flex flex-col flex-grow p-8">
    <h1 class="text-3xl font-extrabold">{{ data.name }}</h1>
    <pre>{{ data }}</pre>
  </div>
</template>
