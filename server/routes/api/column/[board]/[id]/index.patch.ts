import { z } from "zod";
import { updateStatusColumnSchema } from "~/lib/validation";
import type { StatusColumn } from "~~/server/db/schema";
import { isUserAllowedToCreateOrModifyColumns } from "~~/server/services/authorization";
import { updateStatusColumn } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { board: boardId, id: columnId } = await getValidatedRouterParams(
    event,
    z.object({
      board: z.string().uuid(),
      id: z.string().uuid(),
    }).parseAsync,
  );

  if (
    false === (await isUserAllowedToCreateOrModifyColumns(user.id, boardId))
  ) {
    throw createError({
      status: 403,
      message: "You are not authorized to update columns",
    });
  }

  const data = await readValidatedBody(
    event,
    updateStatusColumnSchema.parseAsync,
  );

  const column: StatusColumn | null = await updateStatusColumn(
    boardId,
    columnId,
    data,
  );

  if (!column) {
    throw createError({ status: 404, message: "Column not found" });
  }

  return column;
});
