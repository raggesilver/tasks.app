<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import type { FetchError } from "ofetch";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { z } from "zod";
import { createBoardSchema } from "~/lib/validation";
import type { Board } from "~~/server/db/schema";

const emit = defineEmits(["dismiss"]);

const schema = toTypedSchema(createBoardSchema);

const form = useForm({
  validationSchema: schema,
});

const queryClient = useQueryClient();

const { mutateAsync } = useMutation({
  mutationFn: (data: z.infer<typeof createBoardSchema>) =>
    $fetch("/api/board", {
      method: "POST",
      body: data,
    }),
  onSuccess: (data) => {
    queryClient.setQueryData(["board", data.id], data);
    queryClient.setQueryData<Board[]>(["boards"], (boards) => {
      const normalized = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };

      return boards
        ? [...boards.filter((board) => board.id !== data.id), normalized]
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
      toast.success("Board created successfully.");
    })
    .catch((error: FetchError) => {
      // FIXME: Show error message with vue-sonner
      formError.value =
        (error.data?.message as string) ?? "Failed to create board.";
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
        <FormDescription>This is the name of your board.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <p v-if="formError" class="mt-4 text-[0.8rem] font-medium text-destructive">
      {{ formError }}
    </p>
    <Button type="submit" class="w-full sm:w-auto mt-6">Create Board</Button>
  </form>
</template>
