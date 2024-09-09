<script lang="ts" setup>
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

const links = {
  tos: "Terms of Service",
  privacy: "Privacy",
  features: "Features",
  pricing: "Pricing",
  about: "About",
  contact: "Contact",
};

const index = {
  title: "Stay on top of your tasks with our free Trello alternative.",
  headline:
    "Organize your tasks, boost your productivity, and collaborate with our powerful task management solution.",
  cta: "Start now",
  keyFeatures: "Key Features",
  keyFeaturesDescription: "Boost your productivity with Tasks.app.",
  keyFeaturesHeadline:
    "Manage your tasks, set deadlines, and collaborate with your team all in one place.",
  features: [
    {
      title: "Task Management",
      description: "Create, organize, and prioritize your tasks with ease.",
    },
    {
      title: "Estimate",
      description: "Never forget a task with our deadline system.",
    },
    {
      title: "Collaboration",
      description: "Invite your team to collaborate on tasks and projects.",
    },
    {
      title: "Customization",
      description: "Personalize your todo list with custom tags and labels.",
    },
    {
      title: "Mobile Access",
      description:
        "Stay on top of your tasks on the go. Our platform is mobile-friendly.",
    },
    {
      title: "Reporting",
      description:
        "Track your progress and productivity with detailed reports.",
    },
  ],
  testimonials: {
    title: "What our users say",
    caption:
      "Hear from real people who have used our app to boost their productivity.",
    testimonials: [
      {
        name: "Emily Parker",
        position: "Freelance Graphic Designer",
        quote:
          "Finally, a task management app that keeps things simple yet effective. It's my go-to for staying organized.",
      },
      {
        name: "David Johnson",
        position: "Marketing Manager",
        quote:
          "This app keeps me on track without the clutter. Perfect for managing my busy schedule.",
      },
      {
        name: "Sarah Lee",
        position: "Small Business Owner",
        quote:
          "This app is a lifesaver for my business. It's intuitive, user-friendly, and keeps me focused.",
      },
    ],
  },
  outro: {
    title: "Stay organized and productive with our app",
    caption:
      "Start using our app to take control of your tasks and projects today.",
  },
};

const getUserInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
</script>

<template>
  <div class="flex flex-col min-h-[100vh]">
    <header
      class="px-4 lg:px-6 h-14 flex items-center border-b sticky top-0 bg-background/60 backdrop-filter backdrop-blur-lg"
    >
      <NuxtLink class="flex items-center justify-center" to="#">
        <Icon name="lucide:check" class="h-6 w-6" />
        <span class="ml-2 font-bold text-lg">Tasks.app</span>
      </NuxtLink>
      <div class="ml-auto flex items-center">
        <Sheet>
          <SheetTrigger as-child>
            <Button class="sm:hidden" size="icon" variant="outline">
              <Icon name="lucide:menu" class="h-6 w-6" />
              <span class="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav class="grid gap-6 py-6 text-lg font-medium">
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="#"
              >
                {{ links.features }}
              </NuxtLink>
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="#"
              >
                {{ links.pricing }}
              </NuxtLink>
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="#"
              >
                {{ links.about }}
              </NuxtLink>
              <NuxtLink
                class="text-sm font-medium hover:underline underline-offset-4"
                to="#"
              >
                {{ links.contact }}
              </NuxtLink>
            </nav>
          </SheetContent>
        </Sheet>
        <nav class="hidden gap-4 sm:gap-6 sm:flex">
          <NuxtLink
            class="text-sm font-medium hover:underline underline-offset-4"
            to="#"
          >
            {{ links.features }}
          </NuxtLink>
          <NuxtLink
            class="text-sm font-medium hover:underline underline-offset-4"
            to="#"
          >
            {{ links.pricing }}
          </NuxtLink>
          <NuxtLink
            class="text-sm font-medium hover:underline underline-offset-4"
            to="#"
          >
            {{ links.about }}
          </NuxtLink>
          <NuxtLink
            class="text-sm font-medium hover:underline underline-offset-4"
            to="#"
          >
            {{ links.contact }}
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="flex-1">
      <section class="w-full py-12 md:py-24 lg:py-32 border-b">
        <div class="px-4 md:px-6 space-y-10 xl:space-y-16">
          <div
            class="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16"
          >
            <div>
              <h1
                class="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem ]"
              >
                {{ index.title }}
              </h1>
            </div>
            <div class="flex flex-col items-start space-y-4">
              <p class="mx-auto max-w-[700px] md:text-xl text-muted-foreground">
                {{ index.headline }}
              </p>
              <div class="space-x-4">
                <Button as-child>
                  <NuxtLink to="/sign-in">{{ index.cta }}</NuxtLink>
                </Button>
              </div>
            </div>
          </div>
          <NuxtImg
            width="1270"
            src="https://utfs.io/f/824defbc-2546-47fe-abc9-c29873c08771-qb97hq.webp"
            class="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover object-[center_10%]"
            densities="x1 x2 x3"
            alt="Screenshot of the app"
            :placeholder="[240, 160, 90, 5]"
          />
        </div>
      </section>
      <section class="w-full py-12 md:py-24 lg:py-32">
        <div class="container space-y-12 px-4 md:px-6">
          <div
            class="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div class="space-y-2">
              <div
                class="inline-block rounded-lg px-3 py-1 mb-8 text-sm text-background bg-foreground/70"
              >
                {{ index.keyFeatures }}
              </div>
              <h2 class="text-3xl font-bold tracking-tighter sm:text-5xl">
                {{ index.keyFeaturesDescription }}
              </h2>
              <p
                class="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
              >
                {{ index.keyFeaturesHeadline }}
              </p>
            </div>
          </div>
          <div
            class="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3"
          >
            <div class="grid gap-1" v-for="i of 6" :key="i">
              <h3 class="text-lg font-bold">
                {{ index.features[i - 1].title }}
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ index.features[i - 1].description }}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        class="w-full py-12 md:py-24 lg:py-32 bg-purple-200 dark:bg-purple-900"
      >
        <div
          class="container grid items-center justify-center gap-12 px-4 text-center md:px-6"
        >
          <div class="space-y-3">
            <h2 class="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              {{ index.testimonials.title }}
            </h2>
            <p
              class="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              {{ index.testimonials.caption }}
            </p>
          </div>
          <div
            class="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
          >
            <Card class="flex flex-col justify-between" v-for="i of 3" :key="i">
              <CardHeader class="flex flex-row items-center space-x-2">
                <Avatar>
                  <!-- <AvatarImage src="/avatars/03.png" /> -->
                  <AvatarFallback>{{
                    getUserInitials(index.testimonials.testimonials[i - 1].name)
                  }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="text-left text-sm font-medium leading-none">
                    {{ index.testimonials.testimonials[i - 1].name }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ index.testimonials.testimonials[i - 1].position }}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <p class="text-base leading-relaxed">
                    "{{ index.testimonials.testimonials[i - 1].quote }}"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section class="w-full py-12 md:py-24 lg:py-32">
        <div
          class="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10"
        >
          <div class="space-y-2">
            <h2 class="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              {{ index.outro.title }}
            </h2>
            <p
              class="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              {{ index.outro.caption }}
            </p>
          </div>
          <div class="flex flex-col gap-2 min-[400px]:flex-row">
            <Button as-child class="mr-auto">
              <NuxtLink to="/sign-in">{{ index.cta }}</NuxtLink>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <app-footer />
  </div>
</template>
