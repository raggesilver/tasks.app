<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = defineProps<{
  tooltip: string;
}>();
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <slot v-bind="$attrs" />
      </TooltipTrigger>
      <TooltipContent class="whitespace-pre-wrap">
        {{ props.tooltip }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
