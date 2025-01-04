<script lang="ts" setup>
import { MAX_PLAN_STORAGE } from "~/lib/constants";
import { formatBytes } from "~/lib/utils";
import type { Workspace } from "~~/server/db/schema";

const props = defineProps<{ workspace: Workspace }>();

const { data, suspense, isPending } = useWorkspaceUsage(() =>
  props.workspace.id.toString(),
);

if (import.meta.env.SSR) {
  await suspense();
}

// FIXME: we always assume users are on the same plan. This is not true.
const storagePercentage = computed(() => {
  if (!data.value) return 0;
  return (data.value.usage / MAX_PLAN_STORAGE) * 100;
});
</script>

<template>
  <div class="space-y-lg mt-6">
    <section>
      <div class="flex flex-row items-center gap-2">
        <SheetTitle>Workspace Usage</SheetTitle>
        <ActivityIndicator v-if="isPending" />
      </div>
      <SheetDescription>
        Monitor and manage your workspace usage.
      </SheetDescription>
    </section>

    <div v-if="data" class="grid grid-cols-2 xl:grid-cols-3 gap-2">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Storage</CardTitle>
          <Icon name="lucide:database" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatBytes(data.usage) }}</div>
          <p class="text-xs text-muted-foreground">
            {{ storagePercentage.toFixed(2) }}% of your
            {{ formatBytes(MAX_PLAN_STORAGE) }} limit.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Collaborators</CardTitle>
          <Icon name="lucide:users" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ data.collaborator.inUse }}
            <span class="text-sm text-muted-foreground"
              >of {{ data.collaborator.limit }}</span
            >
          </div>
          <p class="text-xs text-muted-foreground">
            <a href="#" class="text-blue-500">Upgrade</a> to add more.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
