<script setup lang="ts">
import { WORKSPACE_DATA_KEY } from "~/lib/injection-keys";
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
} from "~/components/ui/form";
import { useForm } from "vee-validate";
import { createWorkspaceLabelSchema } from "~/lib/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { Cross2Icon, PlusIcon } from "@radix-icons/vue";
import type { Label } from "~/server/db/schema";
import EasyTooltip from "~/components/easy-tooltip.vue";

const { workspace, labels } = inject(WORKSPACE_DATA_KEY)!;

const router = useRouter();
const isCreatingLabel = computed(() => {
  return "new" in router.currentRoute.value.query;
});

const validationSchema = toTypedSchema(createWorkspaceLabelSchema);
const form = useForm({
  validationSchema,
  initialValues: {
    workspaceId: workspace.value?.id,
    name: "",
    color: "#00FF00",
  },
});

const { mutateAsync } = useCreateLabel();

const onSubmit = form.handleSubmit(async (values) => {
  await mutateAsync(values);
  form.resetForm();
  router.push({ query: {} });
});

const deleteLabel = async (_label: Label) => {
  // TODO: Implement delete label
};
</script>

<template>
  <div v-if="!isCreatingLabel" class="flex flex-col space-y-2">
    <SheetHeader>
      <SheetTitle>Labels</SheetTitle>
      <SheetDescription>Manage your workspace labels.</SheetDescription>
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
        <EasyTooltip tooltip="Delete label">
          <Button
            size="icon"
            variant="ghost"
            class="hidden p-0 w-auto h-auto ml-auto"
            @click="() => deleteLabel(label)"
          >
            <Cross2Icon class="w-4 h-4" />
          </Button>
        </EasyTooltip>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col space-y-2">
    <SheetHeader>
      <SheetTitle>New Label</SheetTitle>
      <SheetDescription>Add a new label for this workspace.</SheetDescription>
    </SheetHeader>

    <form class="space-y-2" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="workspaceId">
        <FormItem>
          <FormControl>
            <input type="hidden" v-bind="componentField" >
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
