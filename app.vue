<script setup lang="ts">
import { ConfigProvider } from "radix-vue";
import { Toaster } from "@/components/ui/sonner";

const useIdFunction = () => useId();
</script>

<template>
  <div class="bg-background" vaul-drawer-wrapper>
    <ConfigProvider :use-id="useIdFunction">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </ConfigProvider>

    <Toaster rich-colors close-button class="z-100" />
  </div>
</template>
