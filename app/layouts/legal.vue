<script setup lang="ts">
const production = ref(import.meta.env.NODE_ENV === "production");
</script>

<template>
  <div
    v-if="!production"
    class="text-background bg-foreground py-4 sticky top-0 left-0 z-50"
  >
    <p class="max-w-[65ch] w-full text-justify mx-auto px-4 md:px-0">
      You are on a preview deployment. The Terms of Service and Privacy Policy
      are drafts and may never become official.
    </p>
  </div>
  <main v-once :class="{ production }">
    <slot />
  </main>
  <app-footer />
</template>

<style>
main {
  position: relative;
}

main:not(.production)::after {
  content: "";
  display: block;

  width: 85px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;

  background-color: currentColor;
  mask-image: url("~~/public/preview.svg");
  mask-size: 85px 325px;
  mask-repeat: no-repeat space;
}

@media (max-width: 800px) {
  main:not(.production) {
    padding: 0 40px 0 10px;
  }

  main:not(.production)::after {
    width: 30px;
    mask-size: 30px 113.2px;
  }
}
</style>
