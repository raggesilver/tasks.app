<script setup lang="ts">
import { Cross2Icon } from "@radix-icons/vue";
import { WORKSPACE_DATA_KEY } from "~/lib/injection-keys";
import type { Label, TaskWithEverything } from "~/server/db/schema";

defineProps<{
  task: TaskWithEverything;
}>();

const { labels } = inject(WORKSPACE_DATA_KEY)!;

const labelMap = computed(
  () =>
    labels.value?.reduce<Record<string, Label>>(
      (acc, label) => ({ ...acc, [label.id]: label }),
      {},
    ) ?? {},
);
</script>

<template>
  <div class="flex flex-row gap-3 items-center flex-wrap">
    <div
      class="relative [&:hover>button]:block"
      v-for="label of task.labels"
      :key="`${label.labelId}-${label.taskId}`"
    >
      <AppLabel :label="labelMap[label.labelId]" class="h-8 px-3" />
      <Button
        class="hidden absolute -top-1 -right-2 w-auto h-auto"
        variant="outline"
        size="icon"
      >
        <Cross2Icon class="w-4 h-4" />
      </Button>
    </div>
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="secondary" size="sm">Add Label</Button>
      </PopoverTrigger>
      <PopoverContent class="p-0">
        <Command>
          <CommandInput placeholder="Search labels" />
          <CommandList>
            <CommandEmpty>No labels found.</CommandEmpty>
            <CommandItem
              v-for="label of labels"
              :key="label.id"
              :value="label.name"
              class="flex items-center gap-2"
            >
              <div
                class="w-3 h-3 rounded-full"
                :style="`background-color: ${label.color};`"
              />
              <span>{{ label.name }}</span>

              <!-- <Icon -->
              <!--   v-if="toggleStatuses[user.id]" -->
              <!--   name="lucide:loader-circle" -->
              <!--   class="w-4 h-4 animate-spin" -->
              <!-- /> -->
              <Icon
                v-if="task.labels.some((l) => l.labelId === label.id)"
                name="lucide:check"
                class="w-4 h-4 ml-auto"
              />
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
