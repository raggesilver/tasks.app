<script lang="ts" setup>
import { useMotionProperties, useSpring } from "@vueuse/motion";
import { getInitials } from "~/lib/utils";

useHead({
  // We need to set this to null explicitly, otherwise when other pages with a
  // title navigate to this page, the title will remain what it was on the other
  // page. We need it to be null to use the default, empty template.
  title: null,
});

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

const heroElement = templateRef<HTMLImageElement>("hero");

const { motionProperties } = useMotionProperties(heroElement, {
  scale: 0.5,
});

// @ts-expect-error — This is exactly what the docs say to do. Not sure why
// the types don't match.
const { set } = useSpring(motionProperties, {
  duration: 300,
  bounce: 0,
});

// const { height: windowHeight } = useWindowSize();
const { y: heroY } = useElementBounding(heroElement);

const { pause, resume } = useRafFn(() => {
  const windowHeight = window.innerHeight;
  const progress = (heroY.value - windowHeight * 0.5) / windowHeight;
  set({ scale: 1 - Math.min(Math.max(progress, 0), 1) * 0.5 });
});

const isHeroVisible = useElementVisibility(heroElement);

watch(
  isHeroVisible,
  () => {
    if (isHeroVisible.value) {
      resume();
    } else {
      pause();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-col min-h-[100vh]">
    <main>
      <div class="p-2 sm:p-8">
        <section
          class="w-full min-h-[80vh] rounded-3xl flex flex-col items-center overflow-hidden sm:container"
        >
          <div class="flex-1 flex flex-col gap-8 items-center justify-center">
            <h1
              class="text-5xl font-black tracking-tight w-3/4 max-w-[600px] text-center animate-in slide-in-from-top animate-duration-500"
            >
              <span>Stay on top of your tasks with </span>
              <span
                class="!bg-clip-text text-transparent !bg-cover !bg-center"
                style="
                  background: linear-gradient(
                    to top left,
                    #2cd8d5,
                    #c5c1ff,
                    #ffbac3
                  );
                "
                >Tasks.app</span
              >
            </h1>
            <div class="flex flex-col items-center justify-center gap-4 w-full">
              <p
                class="text-xl sm:max-w-[800px] text-center animate-forwards animate-in slide-in-from-top animate-duration-1000"
              >
                Organize your tasks, boost your productivity, and collaborate
                with our powerful task management solution.
              </p>
              <Button
                as-child
                size="lg"
                class="opacity-0 animate-in fade-in animate-out fade-out-100 slide-out-from-bottom animate-duration-1000 animate-delay-[1.2s] animate-forwards animate-ease-out"
              >
                <NuxtLink to="/sign-in">Start now</NuxtLink>
              </Button>
            </div>
          </div>
        </section>

        <section>
          <NuxtImg
            ref="hero"
            src="https://utfs.io/f/jqXQ3kEK1W3LDzf3QlOvHOyKeShNIaCQ3AZTFYLoBPmpWEq7"
            densities="1x 2x"
            alt="Screenshot of the app"
            class="sm:container"
            :style="{ transform: 'scale(0.5)' }"
            :placeholder="[1200, 600, 90, 5]"
          />
          <div
            class="max-w-3xl mx-auto grid sm:grid-cols-2 gap-8 mt-8 text-justify indent-xl [&>*]:duration-200"
          >
            <p v-motion-slide-visible-left>
              With a focus on simplicity and ease of use, Tasks.app is the
              perfect solution for managing your tasks and projects.
            </p>
            <span aria-hidden="true" class="lt-sm:hidden"></span>
            <span aria-hidden="true" class="lt-sm:hidden"></span>
            <p v-motion-slide-visible-right>
              Whether you're a freelancer, small business owner, or part of a
              large team, Tasks.app has everything you need.
            </p>
          </div>
        </section>

        <div
          class="mt-32 invert-theme bg-background text-foreground -sm:mx-8 px-8 py-32"
        >
          <section>
            <div class="container">
              <div
                class="flex flex-col items-center justify-center gap-8 text-center"
              >
                <div class="space-y-2">
                  <div
                    class="inline-block rounded-lg px-3 py-1 mb-8 text-sm text-background bg-foreground/70"
                  >
                    Key Features
                  </div>
                  <h2 class="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Boost your productivity with Tasks.app.
                  </h2>
                  <p
                    class="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  >
                    Manage your tasks, set deadlines, and collaborate with your
                    team all in one place.
                  </p>
                </div>
              </div>
              <div
                class="mx-auto mt-16 grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:grid-cols-3"
              >
                <div v-for="i of 6" :key="i" class="grid gap-1">
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
        </div>

        <section
          class="py-12 -sm:mx-8 md:py-24 lg:py-32 bg-purple-200 dark:bg-purple-900"
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
              <Card
                v-for="i of 3"
                :key="i"
                class="flex flex-col justify-between"
              >
                <CardHeader class="flex flex-row items-center space-x-2">
                  <Avatar>
                    <AvatarFallback>{{
                      getInitials(index.testimonials.testimonials[i - 1].name)
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
      </div>
    </main>
  </div>
</template>
