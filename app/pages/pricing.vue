<script setup lang="ts">
const plans = ref([
  {
    title: "Free",
    description: "Recommended for personal use.",
    price: "Free",
    features: [
      { description: "File Uploads", included: false },
      { description: "Up to 15 collaborators", included: true },
    ],
    cta: "Get Started",
  },
  {
    title: "Pro",
    badge: "Most Popular",
    description: "Recommended for collaboration.",
    price: "$10/mo",
    features: [
      { description: "File Uploads", included: true },
      { description: "Up to 100 collaborators", included: true },
    ],
    highlighted: true,
    ctaLink: "#",
    ctaLinkText: "Get Started",
  },
  {
    title: "Custom",
    description: "Recommended for businesses or high demand teams.",
    price: "Contact Us",
    features: [{ description: "Custom limits", included: true }],
    cta: "Contact Us",
  },
]);

const details = ref([
  ["Unlimited Tasks", "✓", "✓", "✓"],
  ["Unlimited Comments", "✓", "✓", "✓"],
  ["Unlimited Logs", "✓", "✓", "✓"],
  ["Unlimited Boards", "✓", "✓", "✓"],
  ["Unlimited Collaborators", "Up to 15 per workspace", "✓", "✓"],
  ["File Uploads", "✗", "100 GB storage", "Custom"],
]);
</script>

<template>
  <main
    class="flex-grow space-y-32 pt-8 pb-16 sm:container lt-sm:px-4 sm:px-16"
  >
    <section
      class="flex flex-col items-start py-2 sm:py-4 space-y-4 sm:space-y-8"
    >
      <h1 class="text-5xl font-extrabold tracking-tight">Pricing.</h1>

      <p class="sm:w-1/2 sm:text-justify text-left indent-lg animate-delay-500">
        Tasks.app was created to be easier, faster, and cheaper than other
        alternatives. To achieve this, we only charge for features that actively
        cost us money to provide.
      </p>
    </section>

    <section class="space-y-8">
      <h2 class="text-3xl font-bold sr-only">Plans</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 justify-center gap-4 mx-auto">
        <pricing-card v-for="plan in plans" :key="plan.title" v-bind="plan" />
      </div>

      <p class="text-center text-sm text-muted-foreground">
        All plans apply to a single
        <EasyTooltip
          tooltip="A workspace is a collection of boards, tasks, and collaborators. It is the equivalent of an organization."
        >
          <span class="underline italic">workspace</span> </EasyTooltip
        >.
      </p>
    </section>

    <section class="space-y-8">
      <h2 class="text-3xl font-bold">Comparison</h2>

      <Table class="table-fixed w-content">
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Free</TableHead>
            <TableHead>Pro</TableHead>
            <TableHead>Custom</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="detail in details" :key="detail[0]">
            <TableCell>{{ detail[0] }}</TableCell>
            <TableCell>{{ detail[1] }}</TableCell>
            <TableCell>{{ detail[2] }}</TableCell>
            <TableCell>{{ detail[3] }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>

    <section class="space-y-8">
      <h2 class="text-3xl font-bold">Pricing Model</h2>

      <p class="indent-lg">
        Unlike other project management tools, we don't charge per user. Our
        plans apply to one board, which, depending on your plan, may have
        unlimited collaborators.
      </p>
    </section>
  </main>
</template>

<style scoped>
main > section:first-child > * {
  animation-name: fadeIn;
  animation-duration: 0.8s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  opacity: 0;
}

main > section:not(:first-child) {
  animation-name: fadeIn;
  animation-duration: 0.8s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-delay: 1.5s;
  opacity: 0;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  50% {
    transform: translateY(0);
  }
  100% {
    opacity: 1;
  }
}
</style>
