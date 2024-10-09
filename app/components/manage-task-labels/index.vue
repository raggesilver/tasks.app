<script setup lang="ts">
import { toast } from "vue-sonner";
import { BOARD_DATA_KEY } from "~/lib/injection-keys";
import type { TaskWithEverything } from "~~/server/db/schema";

const props = defineProps<{
  task: TaskWithEverything;
}>();

const { labels } = inject(BOARD_DATA_KEY)!;

const { mutateAsync: addLabel } = useTaskAddLabelMutation();
const { mutateAsync: removeLabel } = useTaskRemoveLabelMutation();

const toggleStatuses = reactive<{ [key: string]: boolean }>({});

const labelMap = useArrayToMap("id", labels);

const toggleLabel = async (labelId: string) => {
  if (toggleStatuses[labelId]) {
    return;
  }

  toggleStatuses[labelId] = true;
  const isAssigned = props.task.labels.some((l) => l.labelId === labelId);

  const start = Date.now();
  try {
    await (isAssigned ? removeLabel : addLabel)({
      taskId: props.task.id,
      labelId,
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to update task.");
  } finally {
    const end = Date.now();
    if (end - start < 500) {
      await new Promise((resolve) => setTimeout(resolve, 140 - (end - start)));
    }
    toggleStatuses[labelId] = false;
  }
};
</script>

<template>
  <div
    class="flex flex-row gap-2 items-center flex-wrap select-none cursor-default"
  >
    <div
      v-for="label of task.labels"
      :key="`${label.labelId}-${label.taskId}`"
      class="relative [&:hover>button]:flex"
    >
      <AppLabel :label="labelMap[label.labelId]" class="h-8 px-3" />
      <EasyTooltip tooltip="Remove label">
        <Button
          class="hidden absolute -top-1 -left-2 w-auto h-auto"
          variant="outline"
          size="icon"
          @click="() => toggleLabel(label.labelId)"
        >
          <Icon name="lucide:x" class="w-4 h-4" />
        </Button>
      </EasyTooltip>
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
              @select="() => toggleLabel(label.id)"
            >
              <div
                class="w-3 h-3 rounded-full"
                :style="`background-color: ${label.color};`"
              />
              <span>{{ label.name }}</span>

              <Icon
                v-if="toggleStatuses[label.id]"
                name="lucide:loader-circle"
                class="w-4 h-4 ml-auto animate-spin"
              />
              <Icon
                v-else-if="task.labels.some((l) => l.labelId === label.id)"
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
