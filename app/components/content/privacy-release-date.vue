<script setup lang="ts">
const lastReleaseDate = "2024-08-27";

const production = ref(import.meta.env.NODE_ENV === "production");

const releaseDate = computed(() =>
  production.value ? lastReleaseDate : "RELEASE_DATE",
);
</script>

<template>
  <span>{{ releaseDate }}</span>
</template>
