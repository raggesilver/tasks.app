<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { getFetchErrorMessage } from "~/lib/utils";
import { updateWorkspaceSchema } from "~/lib/validation";
import type { Workspace } from "~~/server/db/schema";

const props = defineProps<{
  workspace: Workspace;
}>();

const validationSchema = toTypedSchema(updateWorkspaceSchema);

const form = useForm({
  validationSchema,
  initialValues: {
    name: props.workspace.name,
  },
});

const isModified = computed(() => {
  return form.meta.value.dirty;
});

const { mutateAsync, isPending } = useUpdateWorkspaceMutation();

const handleSubmit = form.handleSubmit(async (values, { resetForm }) => {
  if (isPending.value || !isModified.value) return;

  try {
    await mutateAsync({ id: props.workspace.id, data: values });

    resetForm({ values });

    toast.success("Workspace updated successfully.");
  } catch (error) {
    toast.error(getFetchErrorMessage(error));
  }
});
</script>

<template>
  <form class="space-y-4" @reset="form.handleReset" @submit="handleSubmit">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Workspace Name</FormLabel>
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

    <Button type="submit">Save Changes</Button>
  </form>
</template>
