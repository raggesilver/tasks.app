import { z } from "zod";

const boardFiltersSchema = z.object({
  assignees: z
    .string()
    .transform((str) => (str === "" ? [] : str.split(",")))
    .pipe(z.array(z.string().uuid()))
    .optional(),
});

type BoardFilters = z.infer<typeof boardFiltersSchema>;

export const useBoardFilters = () => {
  const route = useRoute();
  const router = useRouter();

  const validatedFilters = ref<BoardFilters>({});

  watch(
    () => route.query,
    () => {
      const result = boardFiltersSchema.safeParse(route.query);

      if (result.success) {
        validatedFilters.value = result.data;
      } else {
        console.error("Invalid board filters:", result.error);
        validatedFilters.value = {};
      }
    },
    { immediate: true },
  );

  const updateQuery = (newQuery: Record<string, string>) => {
    router.replace({
      query: {
        ...route.query,
        ...newQuery,
      },
    });
  };

  const setAssignees = (assignees: string[] | null) => {
    if (assignees === null || assignees.length === 0) {
      const { assignees: _, ...restQuery } = route.query;
      router.replace({ query: restQuery });
    } else {
      updateQuery({ assignees: assignees.join(",") });
    }
  };

  const toggleAssignee = (assignee: string) => {
    const currentAssignees = validatedFilters.value.assignees || [];
    const index = currentAssignees.indexOf(assignee);

    console.log("Toggling assignee:", assignee, "Index:", index);

    if (index !== -1) {
      const filtered = currentAssignees.filter((a) => a !== assignee);
      setAssignees(filtered.length > 0 ? filtered : null);
    } else {
      setAssignees([...currentAssignees, assignee]);
    }
  };

  return { filters: validatedFilters, setAssignees, toggleAssignee };
};
