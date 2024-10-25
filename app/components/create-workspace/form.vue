<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import type { FetchError } from "ofetch";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { useCreateWorkspaceMutation } from "~/composables/useWorkspace";
import { createWorkspaceSchema } from "~/lib/validation";

const emit = defineEmits(["dismiss"]);

const { isPending, mutateAsync } = useCreateWorkspaceMutation();

const form = useForm({
  validationSchema: toTypedSchema(createWorkspaceSchema),
  initialValues: {
    name: "",
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  if (isPending.value) {
    return;
  }

  try {
    await mutateAsync(values);
    emit("dismiss");
    toast.success(`Workspace ${values.name} created!`);
  } catch (error: FetchError) {
    // TODO: track error
    toast.error(error.data?.message ?? "An unknown error occurred.");
  }
});
</script>

<template>
  <form class="p-4 pb-2 sm:p-0" @reset="form.handleReset" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input
            placeholder="Ex.: Backend Team"
            type="text"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>This is the name of your workspace.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button class="w-full sm:w-auto mt-6" type="submit">
      Create Workspace
    </Button>
  </form>
</template>
