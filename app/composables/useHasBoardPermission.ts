import type { Board } from "~~/server/db/schema";

export const useHasBoardPermission = (
  board: MaybeRefOrGetter<Board | null | undefined>,
) => {
  // This is a temporary implementation that returns true if the user is the
  // owner of the board

  const { user } = useUserSession();

  const hasPermission = computed(
    () => toValue(board)?.ownerId === user.value?.id,
  );

  return hasPermission;
};
