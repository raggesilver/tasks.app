<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
} from "~/components/ui/breadcrumb";

const route = useRoute();

console.log(toRaw(route.matched));

const breadcrumbs = computed(() => {
  return route.matched
    .map((route) => ({ ...route.meta.breadcrumb, link: route.path }))
    .filter((b) => !!b);
});
</script>

<template>
  <div class="flex flex-row gap-2">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem
          v-for="breadcrumb in breadcrumbs"
          :key="breadcrumb.title"
        >
          <BreadcrumbLink :href="breadcrumb.link">{{
            breadcrumb.title
          }}</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>
