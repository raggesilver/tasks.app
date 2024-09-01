<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    time: Date | string;
    /**
     * The type of time to display.
     * @default "date"
     */
    type?: "date" | "time" | "datetime";
  }>(),
  {
    type: "date",
  },
);

const definitelyDate = computed(() => {
  if (typeof props.time === "string") {
    return new Date(props.time);
  }
  return props.time;
});

const acceptLanguage = useRequestHeader("accept-language")
  ?.split(";")[0]
  ?.split(",");

const method = computed(() => {
  switch (props.type) {
    case "date":
      return "toLocaleDateString";
    case "time":
      return "toLocaleTimeString";
    case "datetime":
      return "toLocaleString";
    default:
      return "toISOString";
  }
});

const formattedDate = computed(() => {
  if (!(definitelyDate.value instanceof Date)) {
    return "Invalid Date";
  }
  try {
    return definitelyDate.value[method.value](acceptLanguage);
  } catch {
    return definitelyDate.value[method.value]();
  }
});
</script>

<template>
  <time :datetime="definitelyDate.toISOString()">{{ formattedDate }}</time>
</template>
