export const useQueryParam = <T extends string>(
  key: MaybeRefOrGetter<string>,
  options?: {
    defaultValue?: MaybeRefOrGetter<T>;
    validate?: (value: unknown) => value is T;
  },
) => {
  const route = useRoute();
  const router = useRouter();

  return computed<T | undefined>({
    get() {
      const val = route.query[toValue(key)]?.toString();
      if (options?.validate && !options.validate(val)) {
        return toValue(options?.defaultValue) as T | undefined;
      }
      return (val ?? toValue(options?.defaultValue)) as T | undefined;
    },
    set(val) {
      if (options?.validate && !options.validate(val)) {
        return;
      }
      router.replace({
        query: {
          ...router.currentRoute.value.query,
          [toValue(key)]: val,
        },
      });
    },
  });
};
