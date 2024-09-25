import { z } from "zod";
import { updateStatusColumnSchema } from "~/lib/validation";
import type { StatusColumn } from "~~/server/db/schema";
import { isUserAllowedToCreateOrModifyColumns } from "~~/server/services/authorization";
import { updateStatusColumn } from "~~/server/services/columns";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { workspace: workspaceId, id: columnId } =
    await getValidatedRouterParams(
      event,
      z.object({
        workspace: z.string().uuid(),
        id: z.string().uuid(),
      }).parseAsync,
    );

  if (
    false === (await isUserAllowedToCreateOrModifyColumns(user.id, workspaceId))
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
    workspaceId,
    columnId,
    data,
  );

  if (!column) {
    throw createError({ status: 404, message: "Column not found" });
  }

  return column;
});
