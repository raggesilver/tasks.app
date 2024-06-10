<script lang="ts" setup>
import useMarkdownParser from "@/composables/useMarkdownParser";

const props = defineProps<{
  taskId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { data: task, suspense } = useTask(props.taskId);

const isOpen = ref(true);

await suspense();

useHead({
  title: task.value?.title,
});

watch(isOpen, (value) => {
  if (!value) {
    emit("close");
  }
});

const parser = useMarkdownParser();
const markdown = ref(await parser(task.value?.description || ""));

watch(
  () => task.value?.description,
  async (value) => {
    markdown.value = await parseMarkdown(value || "");
  },
);
</script>

<template>
  <Dialog v-if="task" v-model:open="isOpen">
    <DialogContent
      class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90dvh] overflow-x-hidden"
    >
      <DialogHeader>
        <DialogTitle class="text-xl font-bold">{{ task.title }}</DialogTitle>
      </DialogHeader>
      <div class="flex gap-4 py-4 overflow-y-auto max-w-full">
        <div class="flex flex-col gap-8 flex-grow-1">
          <section>
            <p class="text-sm text-muted-foreground">Description</p>
            <DialogDescription class="text-base text-foreground">
              <!-- <p class="text-base text-foreground">{{ task.description }}</p> -->
              <MDCRenderer
                :body="markdown.body"
                :data="markdown.data"
                class="markdown"
              />
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
