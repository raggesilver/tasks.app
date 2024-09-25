/**
 * This is a helper function to get the route param value safely.
 *
 * The main difference between this and the `useRouteParam` is that this
 * function will stop updating the value right before the route is left. This
 * prevents the unfortunate behavior of `useRouteParam` where the value becomes
 * `undefined` when the route is left.
 */
export const useRouteParamSafe = (param: string) => {
  const route = useRoute();

  const val = ref(route.params[param]);

  const clear = watch(
    () => route.params[param],
    (newVal) => {
      val.value = newVal;
    },
  );

  onBeforeRouteLeave(() => {
    clear();
  });

  return val;
};
