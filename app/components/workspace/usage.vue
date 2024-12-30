<script lang="ts" setup>
import { Progress } from "~/components/ui/progress";
import { MAX_PLAN_STORAGE } from "~/lib/constants";
import { formatBytes } from "~/lib/utils";
import type { Workspace } from "~~/server/db/schema";

const props = defineProps<{ workspace: Workspace }>();

const { data: usage, suspense } = useWorkspaceUsage(() =>
  props.workspace.id.toString(),
);

if (import.meta.env.SSR) {
  await suspense();
}

// FIXME: we always assume users are on the same plan. This is not true.
const percentage = computed(() => {
  if (!usage.value) return 0;
  return (usage.value / MAX_PLAN_STORAGE) * 100;
});
</script>

<template>
  <div class="space-y-lg mt-6">
    <section>
      <SheetTitle>Workspace Usage</SheetTitle>
      <SheetDescription>
        Monitor and manage your workspace storage usage.
      </SheetDescription>
    </section>

    <LazyEasyTooltip
      v-if="usage !== undefined"
      :tooltip="`You have used ${percentage.toFixed(2)}% of your storage limit (${formatBytes(usage)} of ${formatBytes(MAX_PLAN_STORAGE)}).`"
    >
      <Progress :model-value="Math.max(percentage, 2)" class="h-4" />
    </LazyEasyTooltip>
  </div>
</template>
