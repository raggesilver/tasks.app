<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import type { FetchError } from "ofetch";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { createTaskSchema } from "~/lib/validation";
import { Textarea } from "../ui/textarea";

const props = defineProps<{
  boardId: string;
  statusColumnId: string;
}>();

const emit = defineEmits(["dismiss"]);

const schema = toTypedSchema(createTaskSchema);

const form = useForm({
  validationSchema: schema,
});

const { mutateAsync } = useCreateTaskMutation();

const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const onSubmit = form.handleSubmit((values) => {
  if (isSubmitting.value) return;

  formError.value = null;
  isSubmitting.value = true;

  mutateAsync({
    boardId: props.boardId,
    statusColumnId: props.statusColumnId,
    data: values,
  })
    .then(() => {
      emit("dismiss");
      toast.success("Task created successfully.");
    })
    .catch((error: FetchError) => {
      // FIXME: Show error message with vue-sonner
      formError.value =
        (error.data?.message as string) ?? "Failed to create task.";
    })
    .finally(() => {
      isSubmitting.value = false;
    });
});
</script>

<template>
  <form class="p-4 pb-2 sm:p-0" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Implement new feature"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>This is the title of your task.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <!-- Use a textarea for the description -->
          <Textarea
            placeholder="Implement new feature"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription
          >Add a description detailing requirements and steps to complete your
          task.</FormDescription
        >
        <FormMessage />
      </FormItem>
    </FormField>
    <p v-if="formError" class="mt-4 text-[0.8rem] font-medium text-destructive">
      {{ formError }}
    </p>
    <Button type="submit" class="w-full sm:w-auto mt-6">Create Task</Button>
  </form>
</template>
