export const useBreadcrumbs = defineStore("breadcrumbs-store", () => {
  const route = useRoute();

  const basicBreadcrumbs = [
    {
      title: "Home",
      link: "/app",
    },
  ];

  const breadcrumbs = ref<{ title: string; link: string }[]>([
    ...basicBreadcrumbs,
  ]);

  // watch(
  //   () => route.path,
  //   () => {
  //     breadcrumbs.value = [...basicBreadcrumbs];
  //   },
  // );

  return {
    breadcrumbs,
    setBreadcrumbs: (
      newBreadcrumbs: { title: string; link: string }[],
      useBasic = true,
    ) => {
      if (useBasic) {
        breadcrumbs.value = [...basicBreadcrumbs, ...newBreadcrumbs];
      } else {
        breadcrumbs.value = [...newBreadcrumbs];
      }
    },
  };
});
