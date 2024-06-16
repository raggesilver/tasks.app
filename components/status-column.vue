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
    toast("Column updated successfully");
  },
  onError: () => {
    toast.error("Failed to update column");
  },
});

await suspense();

const showEditModal = ref(false);
const showCreateTaskModal = ref(false);
const canDragColumn = ref(false);
const dragOverType = ref<"task" | "left" | "right" | null>(null);

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

  const isLeft = event.offsetX / columnElement.clientWidth < 0.5;
  const leftToRight = droppedColumn.order < props.column.order;
  const newOrder =
    isLeft && leftToRight
      ? props.column.order - 1
      : !isLeft && !leftToRight
        ? props.column.order + 1
        : props.column.order;

  if (newOrder === droppedColumn.order) {
    return;
  }

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
      toast("Task moved successfully");
    })
    .catch((err) => {
      console.error(err);
      toast.error("Failed to move task");
    });
};

const onDrop = async (event: DragEvent) => {
  dragOverType.value = null;
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

  event.dataTransfer!.effectAllowed = "move";
  event.dataTransfer!.dropEffect = "move";

  event.dataTransfer!.setData("drop-type/task", "task");
  event.dataTransfer!.setData(
    "status-column-id/" + task.statusColumnId,
    task.statusColumnId,
  );

  // We can only access these in the `drop` event
  event.dataTransfer!.setData("type", "task");
  event.dataTransfer!.setData("task", JSON.stringify(task));
};

const onColumnDragStart = (event: DragEvent) => {
  event.stopPropagation();
  event.dataTransfer!.effectAllowed = "move";
  event.dataTransfer!.dropEffect = "move";

  event.dataTransfer!.setData("type", "status-column");
  event.dataTransfer!.setData("status-column", JSON.stringify(props.column));

  event.dataTransfer!.setData("drop-type/status-column", "status-column");
  event.dataTransfer!.setData(
    "status-column-id/" + props.column.id,
    props.column.id,
  );
};

const onDragOver = (event: DragEvent) => {
  // The HTML DnD API doesn't allow for dataTransfer stuff to be read on evetns
  // other than drop, so we have to do this hacky thing to get the data we need.
  //
  // We happen to be able to access types, which gives us access to "keys" in a
  // key-value pair.
  const dropType = event.dataTransfer?.types
    .find((type) => type.startsWith("drop-type/"))
    ?.split("/")?.[1];
  const statusColumnId = event.dataTransfer?.types
    .find((type) => type.startsWith("status-column-id/"))
    ?.split("/")?.[1];

  switch (dropType) {
    case "task":
      if (statusColumnId && statusColumnId !== props.column.id) {
        dragOverType.value = "task";
      }
      break;
    case "status-column":
      if (statusColumnId && statusColumnId !== props.column.id) {
        const columnElement = (event.target as HTMLElement).closest(
          ".status-column",
        );
        const isLeft = event.offsetX / columnElement!.clientWidth < 0.5;
        dragOverType.value = isLeft ? "left" : "right";
      }
      break;
    default:
      break;
  }
};

const onDragLeave = () => {
  dragOverType.value = null;
};

const classesForDragOverType = computed(() => {
  switch (dragOverType.value) {
    case "task":
      return "border-blue-400";
    case "left":
      return "border-l-blue-400 border-solid";
    case "right":
      return "border-r-blue-400 border-solid";
    default:
      return "border-transparent";
  }
});
</script>

<template>
  <Card
    class="w-xs flex-shrink-0 self-start bg-muted status-column drag border-3 border-dashed"
    :class="classesForDragOverType"
    @drop="onDrop"
    @dragover.prevent="onDragOver"
    @dragenter.prevent
    @dragleave="onDragLeave"
    @dragend="onDragLeave"
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
        <MiniTask
          v-for="task in tasks"
          :key="task.id"
          :task
          draggable="true"
          :onDragStart="onDragStart"
        />
      </ol>
      <!-- List of tasks -->
      <EditColumn :column v-model:is-open="showEditModal" />
      <CreateTask
        v-bind="{ workspaceId: column.workspaceId, statusColumnId: column.id }"
        v-model:is-open="showCreateTaskModal"
      />
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
</template>
