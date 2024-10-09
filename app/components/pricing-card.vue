<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    badge?: string;
    price: string;
    features: { description: string; included: boolean }[];
    highlighted?: boolean;
    ctaLink?: string;
    ctaLinkText?: string;
    cta?: string;
  }>(),
  {
    cta: "Get Started",
  },
);
</script>

<template>
  <Card class="flex flex-col" :class="{ 'border-current': highlighted }">
    <CardHeader>
      <CardTitle class="font-bold inline-flex items-center gap-4 text-3xl">
        {{ title }}
        <Badge v-if="badge" class="rounded-full">
          {{ badge }}
        </Badge>
      </CardTitle>
      <CardDescription v-if="description" class="text-sm text-muted-foreground">
        {{ description }}
      </CardDescription>

      <p class="text-center text-2xl font-extrabold mt-8">{{ price }}</p>
    </CardHeader>

    <CardContent class="flex flex-col">
      <ul class="mt-4 list-disc-inside">
        <li v-for="feature in features" :key="feature.description">
          <span :class="{ 'line-through': !feature.included }">{{
            feature.description
          }}</span>
        </li>
      </ul>
    </CardContent>
    <CardFooter class="mt-auto">
      <Button
        :variant="highlighted ? 'default' : 'outline'"
        :as-child="!!props.ctaLink"
        class="w-full"
      >
        <NuxtLink v-if="props.ctaLink" :to="props.ctaLink">{{
          props.ctaLinkText
        }}</NuxtLink>
        <span v-else>{{ props.cta }}</span>
      </Button>
    </CardFooter>
  </Card>
</template>
