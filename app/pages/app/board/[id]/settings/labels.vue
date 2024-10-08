<script setup lang="ts">
import { Cross2Icon, PlusIcon } from "@radix-icons/vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import EasyTooltip from "~/components/easy-tooltip.vue";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { BOARD_DATA_KEY } from "~/lib/injection-keys";
import { createBoardLabelSchema } from "~/lib/validation";
import type { Label } from "~~/server/db/schema";

const { board, labels } = inject(BOARD_DATA_KEY)!;

const router = useRouter();
const isCreatingLabel = computed(() => {
  return "new" in router.currentRoute.value.query;
});

const validationSchema = toTypedSchema(createBoardLabelSchema);
const form = useForm({
  validationSchema,
  initialValues: {
    boardId: board.value?.id,
    name: "",
    color: "#00FF00",
  },
  keepValuesOnUnmount: true,
});

const { mutateAsync } = useCreateLabel();
const { mutateAsync: deleteLabelMutation } = useDeleteLabel();

const onSubmit = form.handleSubmit(async (values, { resetForm }) => {
  await mutateAsync(values);

  resetForm({
    values: {
      boardId: board.value?.id ?? "",
      name: "",
      color: "#00FF00",
    },
  });

  router.replace({ query: {} });
});

const deleteLabel = async (_label: Label) => {
  try {
    await deleteLabelMutation({
      labelId: _label.id,
      boardId: _label.boardId,
    });
    toast.success("Label deleted successfully.");
  } catch {
    toast.error("Failed to delete label.");
  }
};
</script>

<template>
  <div v-if="!isCreatingLabel" class="flex flex-col space-y-2">
    <SheetHeader>
      <SheetTitle>Labels</SheetTitle>
      <SheetDescription>Manage your board labels.</SheetDescription>
    </SheetHeader>

    <div class="flex flex-row justify-end items-center">
      <Button size="sm" variant="outline" as-child>
        <NuxtLink :to="{ query: { new: '' } }">New Label</NuxtLink>
      </Button>
    </div>

    <div class="flex flex-col">
      <NuxtLink
        :to="{ query: { new: '' } }"
        class="flex flex-row gap-2 items-center cursor-pointer hover:bg-foreground/5 p-2 rounded-md"
      >
        <PlusIcon class="w-4 h-4 bg-foreground text-background rounded-full" />
        Create a new label
      </NuxtLink>
      <div
        v-for="label of labels"
        :key="label.id"
        class="flex flex-row gap-2 items-center cursor-pointer hover:bg-foreground/5 p-2 rounded-md [&:hover>button]:block"
      >
        <div
          class="w-4 h-4 rounded-full"
          :style="{ backgroundColor: label.color }"
        />
        <span>{{ label.name }}</span>
        <AlertDialog>
          <EasyTooltip tooltip="Delete label">
            <AlertDialogTrigger as-child>
              <Button
                size="icon"
                variant="ghost"
                class="hidden p-1 w-auto h-auto ml-auto"
              >
                <Cross2Icon class="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
          </EasyTooltip>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                label and remove it from all tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                @click="() => deleteLabel(label)"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col space-y-2">
    <SheetHeader>
      <SheetTitle>New Label</SheetTitle>
      <SheetDescription>Add a new label for this board.</SheetDescription>
    </SheetHeader>

    <form class="space-y-2" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="boardId">
        <FormItem>
          <FormControl>
            <input type="hidden" v-bind="componentField" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Bug" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="color">
        <FormItem>
          <FormLabel>Color</FormLabel>
          <FormControl>
            <Input type="color" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" class="w-full sm:w-auto !mt-6">Create Label</Button>
    </form>
  </div>
</template>
