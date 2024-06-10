<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    as?: string;
  }>(),
  {
    as: "div",
  },
);
</script>

<template>
  <component
    :is="props.as"
    :class="
      cn('rounded-xl border bg-card text-card-foreground shadow', props.class)
    "
  >
    <slot />
  </component>
</template>
