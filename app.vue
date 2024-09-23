<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { ConfigProvider } from "radix-vue";

useHead({
  titleTemplate: (title) => (title ? `${title} | Tasks.app` : "Tasks.app"),
});
</script>

<template>
  <div class="bg-background" vaul-drawer-wrapper>
    <ConfigProvider v-bind="{ useId }">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </ConfigProvider>

    <Toaster rich-colors close-button class="z-100" />
  </div>
</template>
