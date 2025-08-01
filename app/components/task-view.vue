<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useMagicKeys, whenever } from "@vueuse/core";
import { FetchError } from "ofetch";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { MAX_FILE_SIZE } from "~/lib/constants";
import { updateTaskSchema } from "~/lib/validation";

const props = defineProps<{
  taskId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { mutateAsync: mutate } = useTaskMutation();
const {
  mutateAsync: deleteTask,
  isPending: isDeleting,
  isSuccess,
} = useDeleteTaskMutation();

// If the task is being deleted or has been successfully deleted, we should
// not attempt to load the task.
const enabled = computed(() => !isDeleting.value && !isSuccess.value);

const {
  data: task,
  error,
  isPending: isTaskPending,
} = useTask(props.taskId, {
  enabled,
});

const isOpen = ref(true);
const isEditing = ref(false);
const route = useRoute();
const boardId = computed(() => route.params.id.toString());
const showSubmitShortcut = ref(false);

const { data: board } = useBoard(boardId);
const { mutateAsync: addAttachment } = useAddTaskAttachmentMutation();

// This component is not mounted on the server. Once it is we should await
// for the queries above.

// If we fail to load the task, present an error and close the task view. Vue
// Query's retry logic will attempt to load the task multiple times before
// finally reaching this if statement.
watch(
  error,
  (val) => {
    if (!val) return;

    const errorMessage =
      val instanceof FetchError && val.status === 404
        ? "Task not found"
        : val.message;

    toast.error(errorMessage);
    emit("close");
  },
  { immediate: true },
);

const schema = toTypedSchema(updateTaskSchema);
const form = useForm({
  validationSchema: schema,
  initialValues: {
    title: task.value?.title,
    description: task.value?.description ?? undefined,
  },
  keepValuesOnUnmount: true,
});

const formError = ref<string | null>(null);

const title = computed(() =>
  isTaskPending.value ? null : `${task.value?.title} on ${board.value?.name}`,
);

useHead({
  title,
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
    .catch((error: FetchError) => {
      toast.error(
        error.response?._data?.message ??
          "An unexpected error occurred while deleting the task.",
      );
    });
};

const editTask = form.handleSubmit(async (values) => {
  if (!task.value) {
    return;
  }
  formError.value = null;
  await mutate({ task: task.value!, data: values })
    .then(() => {
      isEditing.value = false;
      toast.success("Task updated successfully");
    })
    .catch((error: FetchError) => {
      formError.value =
        error.response?._data?.message ?? "Failed to create board.";
    });
});

const keys = useMagicKeys();

const onTextareaEnter = () => {
  showSubmitShortcut.value = true;
};

// TODO: handle command + enter to submit the form
whenever(keys.meta_enter, () => {
  if (isEditing.value) {
    console.log("Meta + Enter on edit");
  }
});

whenever(keys.meta_e, () => (isEditing.value = true));

useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === "Escape" && isEditing.value) {
      isEditing.value = false;
      e.preventDefault();
    }
  },
});

const onFileDropped = async (files: File[]) => {
  if (!task.value) {
    return;
  }

  const uploadPromises = files.map((file) =>
    addAttachment({
      taskId: task.value.id,
      boardId: task.value.boardId,
      columnId: task.value.statusColumnId,
      file,
    })
      .then(() => toast.success(`File ${file.name} uploaded successfully`))
      .catch((error: FetchError) => {
        toast.error(
          error.response?._data?.message ??
            "An unexpected error occurred while uploading your file.",
          { duration: Infinity },
        );
      }),
  );

  await Promise.all(uploadPromises);
};
</script>

<template>
  <Dialog v-if="enabled" v-model:open="isOpen">
    <DialogScrollContent no-close-button class="max-w-3xl">
      <FileDropzone
        :max-file-size="MAX_FILE_SIZE"
        :enabled="enabled && !isTaskPending && !!task"
        @file-dropped="onFileDropped"
      >
        <div class="flex flex-col gap-2">
          <template v-if="isTaskPending">
            <DialogHeader class="flex flex-row gap-2 items-baseline">
              <DialogTitle>
                <Skeleton class="w-sm max-w-full h-[1em] block" />
              </DialogTitle>
              <DialogClose as-child>
                <Button
                  variant="outline"
                  class="w-6 h-6 p-0 flex-shrink-0 ml-auto"
                >
                  <Icon name="lucide:x" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <DialogDescription class="space-y-2 mt-2">
              <Skeleton class="w-full h-[1em]" />
              <Skeleton class="w-3/4 h-[1em]" />
            </DialogDescription>
          </template>
          <!-- Extract this form into its own component -->
          <form
            v-else-if="isEditing"
            class="flex flex-col gap-4"
            @submit="editTask"
          >
            <DialogTitle class="text-xl font-bold">Edit Task</DialogTitle>
            <DialogDescription class="sr-only">
              Use this form to edit the task.
            </DialogDescription>
            <FormField v-slot="{ componentField }" name="title">
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="JavaScript 101"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex flex-col gap-2">
              <FormField v-slot="{ componentField }" name="description">
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      v-bind="componentField"
                      @keypress.enter="onTextareaEnter"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <span
                v-if="showSubmitShortcut"
                class="text-muted-foreground text-xs ml-auto"
              >
                <kbd class="styled font-sans">Esc</kbd> to cancel,
                <kbd class="styled font-sans">⌘ Enter</kbd> to save.
              </span>
            </div>

            <p
              v-if="formError"
              class="mt-4 text-[0.8rem] font-medium text-destructive"
            >
              {{ formError }}
            </p>
            <div class="grid grid-cols-2 gap-2 ml-auto">
              <Button
                type="button"
                class="w-full sm:w-auto mt-6"
                variant="outline"
                @click="isEditing = false"
              >
                Discard Changes
              </Button>
              <Button type="submit" class="w-full sm:w-auto mt-6">
                Save Changes
              </Button>
            </div>
          </form>
          <template v-else-if="task">
            <DialogHeader class="flex flex-row gap-2 items-baseline">
              <DialogTitle class="text-xl font-bold flex">
                <span>{{ task.title }}</span>
              </DialogTitle>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="outline"
                    class="w-6 h-6 p-0 ml-auto flex-shrink-0"
                  >
                    <Icon name="lucide:ellipsis" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  class="grid grid-cols-[min-content_auto_min-content] gap-x-2"
                >
                  <DropdownMenuItem
                    class="grid grid-cols-subgrid col-span-full"
                    @click="isEditing = true"
                  >
                    <Icon name="lucide:pencil" /> Edit Task
                    <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="text-red-500 grid grid-cols-subgrid col-span-full"
                    :disabled="isDeleting"
                    @click="doDeleteTask"
                  >
                    <Icon name="lucide:trash" /> Delete Task
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogClose as-child>
                <Button variant="outline" class="w-6 h-6 p-0 flex-shrink-0">
                  <Icon name="lucide:x" />
                </Button>
              </DialogClose>
            </DialogHeader>

            <ManageTaskLabels :task="task" />
            <div class="flex flex-row-reversep-1 mr-auto gap-1">
              <UniversalUserAvatar
                v-for="assignee of task.assignees"
                :key="assignee.userId"
                :user-id="assignee.userId"
                class="w-8 h-8 [&:not(:first-child)]:-ml-4 border border-border transition-all"
              />
              <ManageTaskAssignees :task-id="task.id" :board-id="boardId">
                <Button
                  variant="outline"
                  class="w-8 h-8 p-0 rounded-full shrink-0"
                >
                  <Icon
                    :name="
                      task?.assignees.length === 0
                        ? 'lucide:user-plus'
                        : 'lucide:ellipsis'
                    "
                  />
                </Button>
              </ManageTaskAssignees>
            </div>

            <div class="flex gap-4 py-4">
              <div class="flex flex-col gap-8 flex-grow-1 max-w-full">
                <section>
                  <h3 class="font-bold mb-2">Description</h3>
                  <DialogDescription
                    class="text-base text-foreground whitespace-pre-wrap"
                  >
                    <template v-if="task.description">{{
                      task.description
                    }}</template>
                    <span v-else class="text-muted-foreground text-sm"
                      >No description</span
                    >
                  </DialogDescription>
                </section>

                <!-- Temporary -->
                <!-- <ScrollArea class="w-full whitespace-nowrap"> -->
                <div
                  v-if="task.attachments.length > 0"
                  class="overflow-x-auto pb-4"
                >
                  <ul class="flex flex-row gap-2">
                    <li
                      v-for="attachment of task.attachments"
                      :key="attachment.id"
                    >
                      <AttachmentPreview :attachment />
                    </li>
                  </ul>
                </div>
                <!--   <ScrollBar orientation="horizontal" /> -->
                <!-- </ScrollArea> -->

                <section>
                  <h3 class="font-bold mb-2">Activity</h3>

                  <ol class="text-xs flex flex-col gap-2 text-muted-foreground">
                    <li v-if="task.lastUpdatedById">
                      Last updated at
                      {{ new Date(task.updatedAt).toLocaleString() }} by
                      <UserNameLabel :user-id="task?.lastUpdatedById" />
                    </li>
                    <li>
                      Created at {{ new Date(task.createdAt).toLocaleString() }}
                      <template v-if="task.createdById">
                        by
                        <UserNameLabel
                          v-if="task"
                          :user-id="task.createdById"
                        />
                      </template>
                    </li>
                  </ol>
                </section>
              </div>
            </div>
          </template>
        </div>
      </FileDropzone>
    </DialogScrollContent>
  </Dialog>
</template>
