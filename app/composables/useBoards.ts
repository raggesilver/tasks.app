import { queryOptions } from "@tanstack/vue-query";
import type { SerializeObject } from "nitropack";
import type { Board } from "~~/server/db/schema";

export const getBoardsOptions = () =>
  queryOptions<Board[]>({
    queryKey: ["boards"],
  });

export const getBoardOptions = (id: MaybeRefOrGetter<string>) =>
  queryOptions<Board>({
    queryKey: ["board", id],
  });

export const normalizeBoard = (board: SerializeObject<Board>): Board => ({
  ...board,
  createdAt: new Date(board.createdAt),
  updatedAt: new Date(board.updatedAt),
});

/**
 * Fetches all boards.
 *
 * This also sets up the cache for each board.
 */
export const useBoards = () => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getBoardsOptions().queryKey,
      queryFn: () =>
        // We need to use `useRequestFetch` instead of `fetch` because of a bug
        // in Nuxt that doesn't include cookies in SSR requests.
        //
        // https://github.com/Atinux/nuxt-auth-utils/issues/97#issuecomment-2150442690
        //https://github.com/nuxt/nuxt/issues/24813
        useRequestFetch()("/api/board").then((boards) =>
          boards.map((board) => {
            const normalized = normalizeBoard(board);

            client.setQueryData(
              getBoardOptions(normalized.id).queryKey,
              normalized,
            );

            return normalized;
          }),
        ),
    },
    client,
  );
};
