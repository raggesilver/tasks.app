export const useArrayToMap = <
  K extends string | number | symbol,
  T extends Record<K, string | number | symbol>,
>(
  key: K,
  arr: MaybeRefOrGetter<T[] | undefined>,
) => {
  const map = computed<Record<T[K], T>>(
    () =>
      toValue(arr)?.reduce(
        (acc, item) => {
          acc[item[key]] = item;
          return acc;
        },
        {} as Record<T[K], T>,
      ) ?? ({} as Record<T[K], T>),
  );

  return map;
};
