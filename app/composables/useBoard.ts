import { getBoardOptions, normalizeBoard } from "./useBoards";

/**
 * Fetches a board by its ID.
 *
 * @param id The ID of the board to fetch.
 */
export const useBoard = (id: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getBoardOptions(id).queryKey,
      queryFn: () =>
        // We need to use `useRequestFetch` instead of `fetch` because of a bug
        // in Nuxt that doesn't include cookies in SSR requests.
        useRequestFetch()(`/api/board/${toValue(id)}`).then((board) => {
          const normalized = normalizeBoard(board);

          client.setQueryData(getBoardsOptions().queryKey, (boards) => {
            // Update this board in the boards cache if it exists.
            if (boards) {
              const index = boards.findIndex((w) => w.id === normalized.id);
              if (index !== -1) {
                return boards.map((w) =>
                  w.id === normalized.id ? normalized : w,
                );
              } else {
                return [...boards, normalized];
              }
            }
          });

          return normalized;
        }),
    },
    client,
  );
};
