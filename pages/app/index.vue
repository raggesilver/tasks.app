<script setup lang="ts">
import { Card, CardTitle, CardContent, CardHeader } from "~/components/ui/card";

definePageMeta({
  layout: "app",
});

const client = useQueryClient();
const { data, isLoading } = useQuery(
  {
    queryKey: ["workspaces"],
    queryFn: () => $fetch("/workspace"),
  },
  client,
);

watch(data, () => {
  data.value?.forEach((workspace) =>
    client.setQueryData(["workspace", workspace.id], workspace),
  );
});
</script>

<template>
  <div class="flex-grow flex flex-col gap-8 p-8">
    <h1 class="text-3xl font-extrabold">Workspaces</h1>
    <div
      v-if="!isLoading"
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <Card v-for="workspace in data" :key="workspace.id">
        <CardHeader
          ><CardTitle>{{ workspace.name }}</CardTitle></CardHeader
        >
        <CardContent>
          <nuxt-link :to="`/app/workspace/${workspace.id}`" class="text-sm">
            <span>Open Workspace</span>
          </nuxt-link>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
