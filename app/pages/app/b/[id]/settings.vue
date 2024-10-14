<script lang="ts" setup>
definePageMeta({
  name: "board-settings",
});

const links = [
  { label: "General", value: "/" },
  { label: "Collaborators", value: "/collaborators" },
  { label: "Labels", value: "/labels" },
];

const route = useRoute();
</script>

<template>
  <div class="flex flex-col space-y-4 mt-4">
    <div class="links-wrapper mr-auto">
      <NuxtLink
        v-for="link in links"
        :key="link.value"
        :to="`/app/b/${route.params.id}/settings${link.value}`"
        class="link"
        preload
      >
        {{ link.label }}
      </NuxtLink>
    </div>

    <NuxtPage />
  </div>
</template>

<style scoped>
.links-wrapper {
  @apply inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground;
}

.link {
  @apply inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50;

  &.router-link-exact-active {
    @apply bg-background text-foreground shadow;
  }
}
</style>
