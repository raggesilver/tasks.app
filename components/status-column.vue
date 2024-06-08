<script setup lang="ts">
import { toast } from "vue-sonner";
import { z } from "zod";
import type { StatusColumn, Task } from "~/server/db/schema";

const props = defineProps<{
  column: StatusColumn;
}>();

const {
  data: tasks,
  suspense,
  mutate,
} = useTasks(props.column.workspaceId, props.column.id);

const { mutateAsync: mutateStatusColumn } = useStatusColumnMutation({
  onSuccess: () => {
    toast.success("Column updated successfully");
  },
  onError: () => {
    toast.error("Failed to update column");
  },
});

await suspense();

const dropSchema = z.object({
  task: z.any(),
  type: z.literal("task"),
});

const handleColumnDrop = async (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const columnElement = (event.target as HTMLElement).closest(".status-column");

  if (!columnElement) {
    return;
  }

  const droppedColumn = JSON.parse(
    event.dataTransfer!.getData("status-column"),
  );

  if (droppedColumn.id === props.column.id) {
    return;
  }

  const newOrder =
    event.offsetX / columnElement.clientWidth > 0.5
      ? props.column.order + 1
      : props.column.order;

  await mutateStatusColumn({
    col: droppedColumn,
    newOrder,
  });
};

const handleTaskDrop = async (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const data = await dropSchema.safeParseAsync({
    task: JSON.parse(event.dataTransfer!.getData("task") || "null"),
    type: event.dataTransfer!.getData("type"),
  });

  // Invalid drop
  if (!data.success) {
    return;
  }

  event.stopPropagation();

  const { task } = data.data;

  // No need to move the task if it's already in the same column
  if (task.statusColumnId === props.column.id) {
    return;
  }

  await mutate({
    task,
    data: { statusColumnId: props.column.id },
  })
    .then(() => {
      toast.success("Task moved successfully");
    })
    .catch((err) => {
      console.error(err);
      toast.error("Failed to move task");
    });
};

const onDrop = async (event: DragEvent) => {
  const type = event.dataTransfer?.getData("type");

  switch (type) {
    case "task":
      return await handleTaskDrop(event);
    case "status-column":
      return await handleColumnDrop(event);
    default:
      break;
  }
};

const onDragStart = (event: DragEvent, task: Task) => {
  event.stopPropagation();
  event.dataTransfer!.dropEffect = "move";
  event.dataTransfer!.effectAllowed = "move";
  event.dataTransfer!.setData("type", "task");
  event.dataTransfer?.setData("statusColumnId", props.column.id);
  event.dataTransfer?.setData("task", JSON.stringify(task));
};

const onColumnDragStart = (event: DragEvent) => {
  event.stopPropagation();
  event.dataTransfer!.dropEffect = "move";
  event.dataTransfer!.effectAllowed = "move";
  event.dataTransfer!.setData("type", "status-column");
  event.dataTransfer!.setData("status-column", JSON.stringify(props.column));
};

const showEditModal = ref(false);
const showCreateTaskModal = ref(false);

const canDragColumn = ref(false);
</script>

<template>
  <Card
    class="w-xs flex-shrink-0 self-start bg-muted status-column"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
    :draggable="canDragColumn"
    @dragstart="onColumnDragStart"
    v-bind="$attrs"
  >
    <CardHeader class="px-2 pt-2">
      <CardTitle class="flex flex-row gap-2 items-center">
        <div
          class="drag-handle text-muted-foreground cursor-grab"
          @mousedown="canDragColumn = true"
          @touchstart="canDragColumn = true"
          @mouseup="canDragColumn = false"
          @touchend="canDragColumn = false"
        >
          <Icon name="lucide:ellipsis-vertical" />
          <Icon name="lucide:ellipsis-vertical" style="margin-left: -8px" />
        </div>
        <span class="flex-grow">
          {{ column.name }}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="w-8 h-8 p-0" size="sm">
              <Icon name="lucide:ellipsis" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel class="pr-8">Column Actions</DropdownMenuLabel>
            <DropdownMenuItem @click="showEditModal = true">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Tasks</DropdownMenuLabel>
            <DropdownMenuItem disabled>Create Task</DropdownMenuItem>
            <DropdownMenuItem disabled>Archive All Tasks</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardTitle>
    </CardHeader>
    <CardContent class="px-2">
      <ol v-if="tasks" ref="tasksRef" class="flex flex-col gap-2">
        <Card
          v-for="task in tasks"
          :key="task.id"
          class="shadow-none text-sm task-card dark:bg-background/40"
          draggable="true"
          @dragstart="onDragStart($event, task)"
        >
          <CardHeader>
            <CardTitle class="font-normal">{{ task.title }}</CardTitle>
          </CardHeader>
        </Card>
      </ol>
      <!-- List of tasks -->
    </CardContent>
    <CardFooter class="pb-2 px-2">
      <Button
        variant="outline"
        class="w-full"
        size="sm"
        @click="showCreateTaskModal = true"
        >Add Task</Button
      >
    </CardFooter>
  </Card>
  <EditColumn :column v-model:is-open="showEditModal" />
  <CreateTask
    v-bind="{ workspaceId: column.workspaceId, statusColumnId: column.id }"
    v-model:is-open="showCreateTaskModal"
  />
</template>
