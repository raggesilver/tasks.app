<script setup lang="ts">
import { toast } from "vue-sonner";
import { formatFileSize } from "~/lib/utils";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    enabled?: boolean;
    maxFileSize?: number | null;
  }>(),
  {
    title: "Drag and drop files here",
    subtitle: undefined,
    enabled: true,
    maxFileSize: null,
  },
);

const emit = defineEmits<{
  fileDropped: [File[]];
}>();

const resolvedSubtitle = computed(() => {
  if (props.subtitle) return props.subtitle;
  if (props.maxFileSize === null) return props.subtitle;
  return `You can upload files up to ${formatFileSize(props.maxFileSize)})`;
});

const wrapper = useTemplateRef<HTMLDivElement>("wrapper");
const isDropping = ref(false);

const onDragEnter = () => {
  if (!props.enabled) return;
  isDropping.value = true;
};

const onDragOver = () => {
  if (!props.enabled) return;
  isDropping.value = true;
};

const onDragLeave = () => {
  if (!props.enabled) return;
  isDropping.value = false;
};

const onDrop = (event: DragEvent) => {
  if (!props.enabled) return;
  isDropping.value = false;

  const droppedFiles = event.dataTransfer?.files;
  if (!droppedFiles) return;

  const files: File[] = markRaw([]);

  for (const file of droppedFiles) {
    if (props.maxFileSize !== null && file.size > props.maxFileSize) {
      toast.error(`File ${file.name} is too large`);
      continue;
    }
    files.push(file);
  }

  emit("fileDropped", files);
};

watch(
  () => props.enabled,
  (val) => {
    if (!val) {
      isDropping.value = false;
    }
  },
);

const isActive = computed(() => isDropping.value);
</script>

<template>
  <div
    ref="wrapper"
    class="relative min-w-[1px]"
    @dragover.prevent="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <slot />
    <div
      class="absolute [&:not(.active)]:hidden w-full h-full top-0 left-0 pointer-events-none"
      :class="{ active: isActive }"
    >
      <div
        class="flex items-center justify-center w-full h-full bg-background/80 backdrop-filter backdrop-blur-lg border-2 border-dashed rounded-lg p-4"
      >
        <div class="flex flex-col items-center gap-2">
          <p class="text-lg font-bold">{{ title }}</p>
          <p v-if="resolvedSubtitle" class="text-muted-foreground">
            {{ resolvedSubtitle }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
