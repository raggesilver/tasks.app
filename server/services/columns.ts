import { and, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import type {
  CreateStatusColumnInput,
  UpdateStatusColumnInput,
} from "~/lib/validation";
import { db } from "../db/db";
import { statusColumns, type StatusColumn } from "../db/schema";
import { DuplicateError, isPostgresError } from "../lib/errors";

// This service does not perform RBAC checks on users/boards before
// executing queries. We leave this to the resolver layer.

/**
 * Create a new status column.
 *
 * @param data - The status column data.
 * @param userId - The user ID.
 * @returns The created status column.
 *
 * @throws {DuplicateError} If a status column with the same name already exists.
 */
export const createStatusColumn = async ({
  userId,
  ...data
}: CreateStatusColumnInput & {
  boardId: string;
  userId: string;
}): Promise<StatusColumn> => {
  try {
    return db
      .insert(statusColumns)
      .values({
        ...data,
        createdById: userId,
        // Set the order to the maximum order + 1, or 0 if there are no status
        // columns for this board.
        order: sql`COALESCE((SELECT MAX(${statusColumns.order}) + 1 FROM ${statusColumns} WHERE ${statusColumns.boardId} = ${data.boardId}), 0)`,
      })
      .returning()
      .execute()
      .then((rows) => rows[0]);
  } catch (e) {
    if (isPostgresError(e) && e.code === "23505") {
      throw new DuplicateError("name");
    }
    throw e;
  }
};

// export const updateStatusColumn = async (

export const getStatusColumn = async (
  boardId: string,
  id: string,
): Promise<StatusColumn | null> => {
  return db.query.statusColumns
    .findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.boardId, boardId), eq(table.id, id)),
    })
    .execute()
    .then((row) => row ?? null);
};

/**
 * Get all status columns for a board.
 *
 * @param boardId - The board ID.
 * @returns A list of status columns.
 *
 * @throws {NotFoundError} If the board does not exist.
 */
export const getStatusColumns = async (
  boardId: string,
): Promise<StatusColumn[]> => {
  return db.query.statusColumns
    .findMany({
      where: (table, { eq }) => eq(table.boardId, boardId),
      orderBy: (table, { asc }) => asc(table.order),
    })
    .execute();
};

export const updateStatusColumn = async (
  boardId: string,
  id: string,
  data: UpdateStatusColumnInput,
): Promise<StatusColumn | null> => {
  const row = await db.transaction(async (tx) => {
    // TODO: we can optimize this by only executing the query if the order is
    // being updated.
    const current = await tx.query.statusColumns
      .findFirst({
        where: (table, { eq, and }) =>
          and(eq(table.boardId, boardId), eq(table.id, id)),
      })
      .execute();

    if (!current) return null;

    if (typeof data.order === "number" && data.order !== current.order) {
      if (data.order < current.order) {
        await tx
          .update(statusColumns)
          .set({ order: sql`${statusColumns.order} + 1` })
          .where(
            and(
              eq(statusColumns.boardId, boardId),
              lt(statusColumns.order, current.order),
              gte(statusColumns.order, data.order),
            ),
          )
          .execute();
      } else {
        await tx
          .update(statusColumns)
          .set({ order: sql`${statusColumns.order} - 1` })
          .where(
            and(
              eq(statusColumns.boardId, boardId),
              gt(statusColumns.order, current.order),
              lte(statusColumns.order, data.order),
            ),
          )
          .execute();
      }
    }

    return tx
      .update(statusColumns)
      .set(data)
      .where(and(eq(statusColumns.boardId, boardId), eq(statusColumns.id, id)))
      .returning()
      .execute()
      .then((rows) => rows[0]);
  });

  return row;
};

export const deleteStatusColumn = async (
  boardId: string,
  id: string,
): Promise<boolean> => {
  return await db.transaction(async (tx) => {
    const current = await tx.query.statusColumns
      .findFirst({
        where: (table, { eq, and }) =>
          and(eq(table.boardId, boardId), eq(table.id, id)),
      })
      .execute();

    if (!current) return false;

    const deleted = await tx
      .delete(statusColumns)
      .where(and(eq(statusColumns.boardId, boardId), eq(statusColumns.id, id)))
      .returning()
      .execute();

    if (deleted.length === 0) return false;

    // Update the order of all columns with an order greater than the deleted
    // column.
    await tx
      .update(statusColumns)
      .set({ order: sql`${statusColumns.order} - 1` })
      .where(
        and(
          eq(statusColumns.boardId, boardId),
          gt(statusColumns.order, current.order),
        ),
      )
      .execute();

    return true;
  });
};
