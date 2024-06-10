<script lang="ts" setup>
const props = defineProps<{
  taskId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { data: task, suspense } = useTask(props.taskId);

const isOpen = ref(true);

await suspense();

watch(isOpen, (value) => {
  if (!value) {
    emit("close");
  }
});
</script>

<template>
  <Dialog v-if="task" v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-xl font-bold">{{ task.title }}</DialogTitle>
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
