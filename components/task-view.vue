<script lang="ts" setup>
import { toast } from "vue-sonner";

const props = defineProps<{
  taskId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { data: task, suspense, deleteTask, isDeleting } = useTask(props.taskId);

const isOpen = ref(true);

const result = await suspense();

// If we fail to load the task, present an error and close the task view. Vue
// Query's retry logic will attempt to load the task multiple times before
// finally reaching this if statement.
if (result.error) {
  if (!import.meta.env.SSR) {
    toast.error(result.error.message);
  }
  emit("close");
}

useHead({
  title: task.value?.title,
});

watch(isOpen, (value) => {
  if (!value) {
    emit("close");
  }
});

const doDeleteTask = async () => {
  if (!task.value) {
    return;
  }

  const title = task.value.title;

  await deleteTask(task.value)
    .then(() => {
      isOpen.value = false;
      toast(`Task "${title}" deleted successfully`);
    })
    .catch((error) => {
      toast.error(error.message);
    });
};
</script>

<template>
  <Dialog v-if="task && !isDeleting" v-model:open="isOpen">
    <DialogContent no-close-button>
      <DialogHeader class="flex flex-row gap-2 items-center">
        <DialogTitle class="text-xl font-bold">{{ task.title }}</DialogTitle>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="w-6 h-6 p-0 ml-auto">
              <Icon name="lucide:ellipsis" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              class="text-red-500"
              @click="doDeleteTask"
              :disabled="isDeleting"
            >
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogClose as-child>
          <Button variant="outline" class="w-6 h-6 p-0">
            <Icon name="lucide:x" />
          </Button>
        </DialogClose>
      </DialogHeader>
      <div class="flex gap-4 py-4">
        <div class="flex flex-col gap-8 flex-grow-1">
          <section>
            <p class="text-sm text-muted-foreground">Description</p>
            <DialogDescription>
              <p class="text-base text-foreground">{{ task.description }}</p>
            </DialogDescription>
          </section>

          <section>
            <h2 class="font-bold mb-2">Activity</h2>

            <ol class="text-xs flex flex-col gap-2 text-muted-foreground">
              <li v-if="task.lastUpdatedById">
                Last updated at
                {{ new Date(task.updatedAt).toLocaleString() }} by
                <UserNameLabel :userId="task.lastUpdatedById" />
              </li>
              <li>
                Created at {{ new Date(task.createdAt).toLocaleString() }}
                <template v-if="task.createdById">
                  by <UserNameLabel :userId="task.createdById" />
                </template>
              </li>
            </ol>
          </section>
        </div>
        <!-- Sidebar -->
        <!--<Separator orientation="vertical" />
          <div class="flex flex-col gap-2">
        </div>-->
      </div>
    </DialogContent>
  </Dialog>
</template>
