<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
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
      <TooltipContent
        class="max-w-[100vw] sm:max-w-[70%] md:max-w-[400px] whitespace-pre-wrap"
      >
        {{ props.tooltip }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
