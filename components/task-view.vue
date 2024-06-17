<script lang="ts" setup>
import { toast } from "vue-sonner";
import { useMagicKeys, whenever } from "@vueuse/core";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { updateTaskSchema } from "~/lib/validation";
import type { FetchError } from "ofetch";

const props = defineProps<{
  taskId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const {
  data: task,
  suspense,
  deleteTask,
  isDeleting,
  mutate,
} = useTask(props.taskId);

const isOpen = ref(true);
const isEditing = ref(false);

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
        (error.data?.message as string) ?? "Failed to create workspace.";
    });
});

const keys = useMagicKeys();
const metaE = keys["Meta+E"];

whenever(metaE, () => (isEditing.value = true));
</script>

<template>
  <Dialog v-if="task && !isDeleting" v-model:open="isOpen">
    <DialogContent :no-close-button="!isEditing">
      <!-- Extract this form into its own component -->
      <form v-if="isEditing" @submit="editTask" class="flex flex-col gap-4">
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
        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
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
      <template v-else>
        <DialogHeader class="flex flex-row gap-2 items-center">
          <DialogTitle class="text-xl font-bold">{{ task.title }}</DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="w-6 h-6 p-0 ml-auto">
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
                @click="doDeleteTask"
                :disabled="isDeleting"
              >
                <Icon name="lucide:trash" /> Delete Task
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
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
      </template>
    </DialogContent>
  </Dialog>
</template>
