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

await suspense();

const dropSchema = z.object({
  //taskId: z.string().uuid(),
  task: z.any(),
  //statusColumnId: z.string().uuid(),
});

const onDrop = async (event: DragEvent) => {
  const data = await dropSchema.safeParseAsync({
    task: JSON.parse(event.dataTransfer!.getData("task")),
  });

  // Invalid drop
  if (!data.success) {
    console.error(data.error);
    return;
  }

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

const onDragStart = (event: DragEvent, task: Task) => {
  console.log({ event, task });
  event.dataTransfer!.dropEffect = "move";
  event.dataTransfer!.effectAllowed = "move";
  //event.dataTransfer!.setData("taskId", task.id);
  event.dataTransfer?.setData("statusColumnId", props.column.id);
  event.dataTransfer?.setData("task", JSON.stringify(task));
};

const showEditModal = ref(false);
const showCreateTaskModal = ref(false);
</script>

<template>
  <Card
    class="w-xs flex-shrink-0 self-start bg-muted"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <CardHeader class="px-2 pt-2">
      <CardTitle class="flex flex-row gap-2 items-center">
        <div class="drag-handle text-muted-foreground cursor-grab">
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
          class="shadow-none text-sm task-card"
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
