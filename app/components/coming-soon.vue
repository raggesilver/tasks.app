<script lang="ts" setup>
defineProps<{
  withIcon?: boolean;
  large?: boolean;
  vertical?: boolean;
}>();
</script>

<template>
  <span
    :class="{ 'text-xl': large, 'flex-col': vertical }"
    class="flex gap-x-2 gap-y-0 items-center"
  >
    <Icon
      v-if="withIcon"
      :class="large ? 'text-[2em]' : 'text-[1.4em]'"
      name="lucide:hard-hat"
    />
    <span>Coming soon.</span>
  </span>
</template>
