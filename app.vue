<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { ConfigProvider } from "radix-vue";
// import { VueQueryDevtools } from "@tanstack/vue-query-devtools";

const useIdFunction = () => useId();

useHead({
  titleTemplate: (title) => (title ? `${title} | Tasks.app` : "Tasks.app"),
});
</script>

<template>
  <div class="bg-background" vaul-drawer-wrapper>
    <ConfigProvider :use-id="useIdFunction">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </ConfigProvider>

    <!-- <VueQueryDevtools /> -->
    <Toaster rich-colors close-button class="z-100" />
  </div>
</template>
