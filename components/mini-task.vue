<script lang="ts" setup>
import { WORKSPACE_DATA_KEY } from "~/lib/injection-keys";
import type { Task, TaskWithEverything, Label } from "~/server/db/schema";
import { Badge } from "~/components/ui/badge";

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
  return props.task.assignees.length > 0;
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
          <Badge
            v-for="label of task.labels"
            :key="`${label.labelId}-${label.taskId}`"
            class="text-xs py-[1px] px-1"
            variant="outline"
            :style="`background-color: ${labelMap[label.labelId].color}80; border-color: ${labelMap[label.labelId].color};`"
          >
            <span class="font-normal text-foreground">{{
              labelMap[label.labelId].name
            }}</span>
          </Badge>
        </div>
        <CardTitle class="font-normal">{{ task.title }}</CardTitle>
      </CardHeader>
      <CardFooter v-if="hasFooterContent" class="p-2 pt-0">
        <div class="flex flex-row gap-0.5 w-full items-center">
          <!-- <ssr-time -->
          <!--   :time="task.createdAt" -->
          <!--   class="text-muted-foreground text-xs mr-auto ml-2" -->
          <!-- /> -->
          <span aria-hidden="true" class="mx-auto" />
          <UserAvatar
            v-for="assignee in task.assignees"
            :key="assignee.userId"
            :userId="assignee.userId"
            class="w-6 h-6"
          />
        </div>
      </CardFooter>
    </NuxtLink>
  </Card>
</template>
