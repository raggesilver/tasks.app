<script lang="ts" setup>
import { useForm } from "vee-validate";
import { createWorkspaceSchema } from "~/lib/validation";
import { toTypedSchema } from "@vee-validate/zod";

const emit = defineEmits(["dismiss"]);

const schema = toTypedSchema(createWorkspaceSchema);

const form = useForm({
  validationSchema: schema,
});

const onSubmit = form.handleSubmit((values) => {
  console.log({ values });
  emit("dismiss");
});
</script>

<template>
  <form @submit="onSubmit" class="p-4 pb-2 sm:p-0">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="JavaScript 101"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>This is the name of your workspace.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full sm:w-auto mt-6"
      >Create Workspace</Button
    >
  </form>
</template>
