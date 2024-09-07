<script setup lang="ts">
defineProps<{
  entries: { title: string; link: string }[];
}>();
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(entry, i) in entries" :key="entry.title">
        <BreadcrumbSeparator v-if="i > 0" />
        <BreadcrumbItem>
          <BreadcrumbLink v-if="i < entries.length - 1" as-child>
            <NuxtLink :to="entry.link">
              {{ entry.title }}
            </NuxtLink>
          </BreadcrumbLink>
          <BreadcrumbPage v-else>{{ entry.title }}</BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
