<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { FetchError } from "ofetch";

const client = useQueryClient();

client.setDefaultOptions({
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes

    retry: (count, error) => {
      // Don't retry on 401, 403, or 404 errors.
      if (
        error instanceof FetchError &&
        [401, 403, 404].includes(error.status!)
      ) {
        return false;
      }
      // On non 401, 403, or 404 errors, retry up to 3 times.
      return count < 3;
    },
  },
});

const route = useRoute();

useHead({
  titleTemplate: (title) => (title ? `${title} | Tasks.app` : "Tasks.app"),
});
</script>

<template>
  <div class="bg-background" vaul-drawer-wrapper>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <VueQueryDevtools v-if="route.path.startsWith('/app')" />
    <Toaster rich-colors close-button class="z-100" />
  </div>
</template>
