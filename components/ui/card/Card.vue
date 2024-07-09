<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

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
