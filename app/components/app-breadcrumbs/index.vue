<script setup lang="ts">
defineProps<{
  entries: { title: string; link: string; style?: string }[];
}>();
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(entry, i) in entries" :key="entry.title">
        <BreadcrumbSeparator v-if="i > 0" />
        <BreadcrumbItem>
          <BreadcrumbLink v-if="i < entries.length - 1" as-child>
            <NuxtLink :to="entry.link" :style="entry.style">
              {{ entry.title }}
            </NuxtLink>
          </BreadcrumbLink>
          <BreadcrumbPage v-else :style="entry.style">{{
            entry.title
          }}</BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
