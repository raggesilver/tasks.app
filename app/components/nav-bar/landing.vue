<script setup lang="ts">
import { AUTHORIZED_REDIRECT } from "~/lib/constants";

const { loggedIn } = useUserSession();

const links = {
  tos: "Terms of Service",
  privacy: "Privacy",
  features: "Features",
  pricing: "Pricing",
  about: "About",
  contact: "Contact",
};

const open = ref(false);

const router = useRouter();

watch(
  () => router.currentRoute.value.path,
  () => {
    open.value = false;
  },
);
</script>

<template>
  <header
    class="landing postition sticky top-0 left-0 w-full py-4 lt-sm:px-2 z-20"
  >
    <div class="sm:container">
      <nav
        class="container bg-primary/90 text-background h-16 rounded-full backdrop-blur-lg flex items-center gap-8"
      >
        <NuxtLink to="/" class="font-bold">Tasks.app</NuxtLink>
        <div class="hidden sm:flex mx-auto items-center gap-4">
          <NuxtLink to="#">{{ links.features }}</NuxtLink>
          <NuxtLink to="/pricing">{{ links.pricing }}</NuxtLink>
          <NuxtLink to="#">{{ links.about }}</NuxtLink>
          <NuxtLink to="#">{{ links.contact }}</NuxtLink>
        </div>

        <NuxtLink
          :to="loggedIn ? AUTHORIZED_REDIRECT : '/sign-in'"
          class="hidden sm:inline-flex items-center justify-center bg-background text-foreground h-12 px-8 py-2 -mr-6 rounded-full text-sm font-semibold"
        >
          {{ loggedIn ? "Go to App" : "Sign In" }}
        </NuxtLink>

        <Sheet v-model:open="open">
          <SheetTrigger as-child>
            <button
              class="ml-auto -mr-2 inline-flex sm:hidden items-center justify-center bg-transparent border-none text-background h-12 aspect-square"
            >
              <Icon name="lucide:menu" class="h-6 w-6" />
              <span class="sr-only">Toggle Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle class="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription class="sr-only"></SheetDescription>
            <nav class="grid gap-6 py-6 text-lg font-medium">
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="#"
                >{{ links.features }}</NuxtLink
              >
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="/pricing"
                >{{ links.pricing }}</NuxtLink
              >
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="#"
                >{{ links.about }}</NuxtLink
              >
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="#"
                >{{ links.contact }}</NuxtLink
              >

              <NuxtLink
                :to="loggedIn ? AUTHORIZED_REDIRECT : '/sign-in'"
                class="text-sm font-medium hover:underline underline-offset-4"
              >
                {{ loggedIn ? "Go to App" : "Sign In" }}
              </NuxtLink>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  </header>
  <not-prod-ready />
</template>
