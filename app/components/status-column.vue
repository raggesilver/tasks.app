<script setup lang="ts">
import { toast } from "vue-sonner";
import { z } from "zod";
import { cn } from "~/lib/utils";
import type { StatusColumn, Task } from "~~/server/db/schema";

const props = defineProps<{
  column: StatusColumn;
}>();

const {
  data: tasks,
  suspense,
  isPending,
} = useTasks(props.column.boardId, props.column.id);
const { mutateAsync: mutateTask } = useTaskMutation();

if (import.meta.env.SSR) {
  await suspense();
}

const { mutateAsync: mutateStatusColumn } = useStatusColumnMutation({
  onSuccess: () => {
    toast("Column updated successfully");
  },
  onError: () => {
    toast.error("Failed to update column");
  },
});

const { mutateAsync: deleteColumn, isPending: isDeleting } =
  useDeleteStatusColumn({
    onSuccess: () => {
      toast("Column deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete column");
    },
  });

const showEditModal = ref(false);
const showCreateTaskModal = ref(false);
const canDragColumn = ref(false);
const dragOverType = ref<"task" | "left" | "right" | null>(null);

const { collapsedColumns } = useCollapsedColumns();

const collapsed = computed<boolean>({
  get: () => collapsedColumns.has(props.column.id),
  set: (val) => {
    if (val) {
      collapsedColumns.add(props.column.id);
    } else {
      collapsedColumns.delete(props.column.id);
    }
  },
});

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

  await mutateTask({
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

const doDeleteColumn = async () => {
  if (isDeleting.value) return;

  await deleteColumn(props.column);
};

const { filters } = useBoardFilters();
const filteredTasks = computed(() => {
  return filters.value.assignees
    ? tasks.value?.filter((task) =>
        task.assignees.some((assignee) =>
          filters.value.assignees!.includes(assignee.userId),
        ),
      )
    : tasks.value;
});
</script>

<template>
  <Card
    class="w-xs max-h-full flex flex-col bg-muted dark:bg-background drag border-3 border-dashed dark:[&_*]:border-muted/50 status-column"
    :class="cn(classesForDragOverType, { collapsed })"
    :draggable="canDragColumn"
    v-bind="$attrs"
    @drop="onDrop"
    @dragover.prevent="onDragOver"
    @dragenter.prevent
    @dragleave="onDragLeave"
    @dragend="onDragLeave"
    @dragstart="onColumnDragStart"
  >
    <CardHeader class="px-2 pt-2 card-header">
      <div class="flex flex-row gap-1 items-center card-title">
        <Icon
          name="lucide:grip-vertical"
          class="drag-handle text-muted-foreground cursor-grab"
          @mousedown="canDragColumn = true"
          @touchstart="canDragColumn = true"
          @mouseup="canDragColumn = false"
          @touchend="canDragColumn = false"
        />
        <CardTitle class="flex-grow title">
          {{ column.name }}
          <span
            v-if="collapsed"
            class="mt-2 font-medium text-muted-foreground text-sm"
          >
            <LazySkeleton
              v-if="isPending"
              class="inline-block w-[1em] h-[3em]"
            />
            <span v-else-if="tasks">{{ filteredTasks!.length }} tasks</span>
          </span>
        </CardTitle>
        <EasyTooltip :tooltip="collapsed ? 'Expand Column' : 'Collapse Column'">
          <Button
            variant="outline"
            class="w-6 h-6 p-0 collapse-toggle"
            size="sm"
            @click="() => (collapsed = !collapsed)"
          >
            <Icon v-if="collapsed" name="lucide:chevrons-left-right" />
            <Icon v-else name="lucide:chevrons-right-left" />
          </Button>
        </EasyTooltip>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              class="w-6 h-6 p-0 expanded-only"
              size="sm"
            >
              <Icon name="lucide:ellipsis" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            class="grid grid-cols-[min-content_auto_min-content] gap-x-2"
          >
            <DropdownMenuLabel class="pr-8 col-span-full">
              Column Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              class="grid grid-cols-subgrid col-span-full"
              @click="showEditModal = true"
            >
              <Icon name="lucide:pencil" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              class="text-red-500 grid grid-cols-subgrid col-span-full"
              @click="doDeleteColumn"
            >
              <Icon name="lucide:trash" /> Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator class="col-span-full" />
            <DropdownMenuLabel class="col-span-full">Tasks</DropdownMenuLabel>
            <DropdownMenuItem
              disabled
              class="grid grid-cols-subgrid col-span-full"
            >
              <Icon name="lucide:plus" /> Create Task
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              class="grid grid-cols-subgrid col-span-full"
            >
              <Icon name="lucide:archive" /> Archive All Tasks
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent class="px-2 overflow-y-auto expanded-only">
      <ol v-if="tasks" ref="tasksRef" class="flex flex-col gap-2">
        <MiniTask
          v-for="task in filteredTasks"
          :key="task.id"
          :task
          draggable="true"
          :on-drag-start="onDragStart"
        />
      </ol>
      <LazySkeleton v-else class="w-full h-8" />
      <!-- List of tasks -->
      <EditColumn v-model:is-open="showEditModal" :column />
      <CreateTask
        v-bind="{ boardId: column.boardId, statusColumnId: column.id }"
        v-model:is-open="showCreateTaskModal"
      />
    </CardContent>
    <CardFooter class="pb-2 px-2 expanded-only">
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

<style>
.status-column.collapsed {
  @apply w-12;

  & .card-header {
    @apply p-2;
  }

  & .expanded-only {
    display: none;
  }

  & .card-title {
    flex-direction: column;

    & .title {
      text-orientation: mixed;
      writing-mode: vertical-rl;
    }
  }

  & .collapse-toggle {
    @apply mt-4;
  }
}
</style>
