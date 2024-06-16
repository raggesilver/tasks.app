<script lang="ts" setup>
definePageMeta({
  middleware: ["no-auth"],
});

useHead({
  title: "Sign In",
});

const route = useRoute();

const redirectCookie = useCookie("signInRedirect", {
  path: "/",
  maxAge: 60 * 5,
});

redirectCookie.value = route.query.redirectTo as string | undefined;
</script>

<template>
  <div
    class="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0"
  >
    <Button as-child variant="ghost">
      <nuxt-link class="absolute right-4 top-4 md:right-8 md:top-8" to="/">
        Back to start
      </nuxt-link>
    </Button>
    <div
      class="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex"
    >
      <div class="absolute inset-0 bg-zinc-900" />
      <div class="relative z-20 flex items-center text-lg font-medium">
        <svg
          class="mr-2 h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
          />
        </svg>
        Tasks.app
      </div>
      <div class="relative z-20 mt-auto">
        <blockquote class="space-y-2">
          <p class="text-lg">&ldquo;This app is awesome.&rdquo;</p>
          <footer class="text-sm">Paulo Queiroz</footer>
        </blockquote>
      </div>
    </div>
    <div class="lg:p-8">
      <div
        class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
      >
        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p class="text-sm text-muted-foreground">
            Sign in with one of our auth providers to get started.
          </p>
        </div>

        <div class="grid gap-4">
          <Button as-child class="bg-[#D50F25] hover:bg-red-600 text-white">
            <a href="/auth/google">
              <Icon class="mr-2 h-4 w-4" name="fa6-brands:google" />
              Google
            </a>
          </Button>
          <Button as-child>
            <a href="/auth/github">
              <Icon class="mr-2 h-4 w-4" name="fa6-brands:github" />
              GitHub
            </a>
          </Button>
        </div>

        <p class="px-8 text-center text-sm text-muted-foreground">
          By signing in, you agree to our
          <a
            class="underline underline-offset-4 hover:text-primary"
            href="/terms"
            >terms of service</a
          >
          and
          <a
            class="underline underline-offset-4 hover:text-primary"
            href="/privacy"
            >privacy policy</a
          >.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
