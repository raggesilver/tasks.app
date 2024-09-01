<script lang="ts" setup>
import type { Task, TaskWithAssignees } from "~/server/db/schema";

const props = defineProps<{
  task: TaskWithAssignees;
  onDragStart?: (event: DragEvent, task: Task) => void;
}>();

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
</script>

<template>
  <Card
    class="shadow-none text-sm task-card dark:bg-muted/20 select-none"
    :class="isDragging ? 'cursor-move' : 'cursor-pointer'"
    as="li"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <NuxtLink :to="`?view-task=${task.id}`">
      <CardHeader class="p-4">
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
