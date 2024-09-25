<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import type { FetchError } from "ofetch";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { z } from "zod";
import { createWorkspaceSchema } from "~/lib/validation";
import type { Workspace } from "~~/server/db/schema";

const emit = defineEmits(["dismiss"]);

const schema = toTypedSchema(createWorkspaceSchema);

const form = useForm({
  validationSchema: schema,
});

const queryClient = useQueryClient();

const { mutateAsync } = useMutation({
  mutationFn: (data: z.infer<typeof createWorkspaceSchema>) =>
    $fetch("/api/workspace", {
      method: "POST",
      body: data,
    }),
  onSuccess: (data) => {
    queryClient.setQueryData(["workspace", data.id], data);
    queryClient.setQueryData<Workspace[]>(["workspaces"], (workspaces) => {
      const normalized = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };

      return workspaces
        ? [
            ...workspaces.filter((workspace) => workspace.id !== data.id),
            normalized,
          ]
        : [normalized];
    });
  },
});

const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const onSubmit = form.handleSubmit((values) => {
  if (isSubmitting.value) return;

  formError.value = null;
  isSubmitting.value = true;

  mutateAsync(values)
    .then(() => {
      emit("dismiss");
      toast.success("Workspace created successfully.");
    })
    .catch((error: FetchError) => {
      // FIXME: Show error message with vue-sonner
      formError.value =
        (error.data?.message as string) ?? "Failed to create workspace.";
    })
    .finally(() => {
      isSubmitting.value = false;
    });
});
</script>

<template>
  <form class="p-4 pb-2 sm:p-0" @submit="onSubmit">
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
    <p v-if="formError" class="mt-4 text-[0.8rem] font-medium text-destructive">
      {{ formError }}
    </p>
    <Button type="submit" class="w-full sm:w-auto mt-6"
      >Create Workspace</Button
    >
  </form>
</template>
