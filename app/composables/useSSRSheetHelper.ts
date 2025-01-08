export const useSSRSheetHelper = (isMounted: MaybeRefOrGetter<boolean>) => {
  const shouldUseSSR = ref(true);

  watch(
    () => toValue(isMounted),
    (isMounted) => {
      if (isMounted === false) {
        shouldUseSSR.value = false;
      }
    },
    { immediate: true },
  );

  return shouldUseSSR;
};
