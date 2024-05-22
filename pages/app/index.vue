<script setup lang="ts">
const { session } = useUserSession();
</script>

<template>
  <div>
    <span>Hello, {{ session.user }}</span>
  </div>
</template>
