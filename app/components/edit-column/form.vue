<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import type { FetchError } from "ofetch";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { z } from "zod";
import { updateStatusColumnSchema } from "~/lib/validation";
import type { StatusColumn } from "~~/server/db/schema";

const props = defineProps<{
  column: StatusColumn;
}>();

const localSchema = updateStatusColumnSchema;
type SchemaType = z.infer<typeof localSchema>;

const emit = defineEmits(["dismiss"]);

const schema = toTypedSchema(localSchema);

const form = useForm({
  validationSchema: schema,
  initialValues: {
    name: props.column.name,
  },
});

const queryClient = useQueryClient();

const updateColumn = (
  boardId: string,
  columnId: string,
  data: SchemaType,
): Promise<StatusColumn> => {
  // @ts-ignore TypeScript complains about excessive stack depth comparing types
  return $fetch(`/api/column/${boardId}/${columnId}`, {
    method: "PATCH",
    body: data,
  });
};

const { mutateAsync } = useMutation({
  mutationFn: (data: SchemaType) =>
    updateColumn(props.column.boardId, props.column.id, data),
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
      ["board-columns", props.column.boardId],
      (old) => {
        if (old) {
          return old.map((col) =>
            col.id === normalized.id ? normalized : col,
          );
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
      toast.success("Column updated successfully.");
    })
    .catch((error: FetchError) => {
      // FIXME: Show error message with vue-sonner
      formError.value =
        (error.data?.message as string) ?? "Failed to update column.";
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
    <Button type="submit" class="w-full sm:w-auto mt-6">Update Column</Button>
  </form>
</template>
