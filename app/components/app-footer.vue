<script lang="ts" setup></script>

<template>
  <footer
    class="flex flex-col gap-2 sm:flex-row w-full shrink-0 items-center p-4 border-t"
  >
    <p class="text-xs text-muted-foreground">
      &copy; {{ new Date().getFullYear() }}, Paulo Queiroz.
    </p>
    <nav class="sm:ml-auto flex gap-4 sm:gap-6 items-center">
      <!-- <language-switcher /> -->
      <router-link
        class="text-xs hover:underline underline-offset-4 flex-shrink-0"
        to="/legal/tos"
      >
        Terms of Service
      </router-link>
      <router-link
        class="text-xs hover:underline underline-offset-4 flex-shrink-0"
        to="/legal/privacy-policy"
      >
        Privacy Policy
      </router-link>
    </nav>
  </footer>
</template>
