<script lang="ts" setup>
import type { Task } from "~/server/db/schema";

const props = defineProps<{
  task: Task;
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
      <CardHeader>
        <CardTitle class="font-normal">{{ task.title }}</CardTitle>
      </CardHeader>
    </NuxtLink>
  </Card>
</template>
