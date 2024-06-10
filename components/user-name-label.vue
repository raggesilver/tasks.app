<script setup lang="ts">
defineProps<{
  userId: string;
}>();

// FIXME: implement data fetching once the API is available
</script>

<template>
  <span>{{ userId }}</span>
</template>
