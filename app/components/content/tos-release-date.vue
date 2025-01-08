<script setup lang="ts">
const lastReleaseDate = "2025-01-08";

const production = ref(process.env.NODE_ENV === "production");

const releaseDate = computed(() =>
  production.value ? lastReleaseDate : "RELEASE_DATE",
);
</script>

<template>
  <span>{{ releaseDate }}</span>
</template>
