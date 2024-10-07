<script lang="ts" setup>
import { WORKSPACE_DATA_KEY } from "~/lib/injection-keys";
import type { Label, Task, TaskWithEverything } from "~~/server/db/schema";

const props = defineProps<{
  task: TaskWithEverything;
  onDragStart?: (event: DragEvent, task: Task) => void;
}>();

const { labels } = inject(WORKSPACE_DATA_KEY)!;

const isDragging = ref(false);

const onDragStart = (event: DragEvent) => {
  isDragging.value = true;
  props.onDragStart?.(event, props.task);
};

const onDragEnd = () => {
  isDragging.value = false;
};

const hasFooterContent = computed(() => {
  return props.task.assignees.length > 0 || props.task.attachments.length > 0;
});

const labelMap = computed(() => {
  return (
    labels.value?.reduce<Record<string, Label>>((acc, label) => {
      acc[label.id] = label;
      return acc;
    }, {}) ?? {}
  );
});
</script>

<template>
  <Card
    class="shadow-none text-sm task-card dark:bg-muted/20 select-none"
    :class="isDragging ? 'cursor-move' : 'cursor-pointer'"
    as="li"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <NuxtLink :to="{ query: { 'view-task': task.id } }">
      <CardHeader class="p-4">
        <div
          v-if="task.labels.length > 0"
          class="flex flex-row gap-1 items-center justify-start flex-wrap"
        >
          <AppLabel
            v-for="label of task.labels"
            :key="`${label.labelId}-${label.taskId}`"
            :label="labelMap[label.labelId]"
          />
        </div>
        <CardTitle class="font-normal">{{ task.title }}</CardTitle>
      </CardHeader>
      <CardFooter v-if="hasFooterContent" class="p-2 pt-0">
        <div class="flex flex-row gap-0.5 w-full items-center pl-2">
          <LazyEasyTooltip
            v-if="task.attachments?.length > 0"
            :tooltip="`${task.attachments.length} attachments`"
          >
            <span class="flex items-center gap-1 text-muted-foreground">
              <Icon name="lucide:paperclip" class="w-4 h-4" />
              {{ task.attachments.length }}
            </span>
          </LazyEasyTooltip>
          <!-- <ssr-time -->
          <!--   :time="task.createdAt" -->
          <!--   class="text-muted-foreground text-xs mr-auto ml-2" -->
          <!-- /> -->
          <span aria-hidden="true" class="mx-auto" />
          <UserAvatar
            v-for="assignee in task.assignees"
            :key="assignee.userId"
            :user-id="assignee.userId"
            class="w-6 h-6"
          />
        </div>
      </CardFooter>
    </NuxtLink>
  </Card>
</template>
