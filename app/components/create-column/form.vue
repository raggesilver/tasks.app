<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import type { FetchError } from "ofetch";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { z } from "zod";
import { createStatusColumnSchema } from "~/lib/validation";
import type { StatusColumn } from "~~/server/db/schema";

const localSchema = createStatusColumnSchema.pick({ name: true });
type SchemaType = z.infer<typeof localSchema>;

const workspaceId = useRouteParamSafe("id") as Ref<string>;
const emit = defineEmits(["dismiss"]);

const schema = toTypedSchema(localSchema);

const form = useForm({
  validationSchema: schema,
});

const queryClient = useQueryClient();

const { mutateAsync } = useMutation({
  mutationFn: (data: SchemaType) =>
    $fetch(`/api/column/${workspaceId.value}`, {
      method: "POST",
      body: data,
    }),
  onSuccess: (data) => {
    const normalized: StatusColumn = {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
    queryClient.setQueryData<StatusColumn>(
      ["status-column", normalized.id],
      normalized,
    );
    queryClient.setQueryData<StatusColumn[]>(
      ["workspace-columns", workspaceId],
      (old) => {
        if (old) {
          return [...old, normalized];
        }
      },
    );
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
      toast.success("Column created successfully.");
    })
    .catch((error: FetchError) => {
      // FIXME: Show error message with vue-sonner
      formError.value =
        (error.data?.message as string) ?? "Failed to create column.";
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
        <FormDescription>This is the title of your column.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <p v-if="formError" class="mt-4 text-[0.8rem] font-medium text-destructive">
      {{ formError }}
    </p>
    <Button type="submit" class="w-full sm:w-auto mt-6">Create Column</Button>
  </form>
</template>
