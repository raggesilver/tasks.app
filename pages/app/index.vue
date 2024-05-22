<script setup lang="ts">
const { session } = useUserSession();
const { logout } = useLogout();
</script>

<template>
  <div>
    <span>Hello, {{ session.user }}</span>
    <Button @click="logout"> Logout </Button>
  </div>
</template>
