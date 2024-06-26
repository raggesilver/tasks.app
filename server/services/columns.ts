import { and, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import type {
  CreateStatusColumnInput,
  UpdateStatusColumnInput,
} from "~/lib/validation";
import { db } from "../db/db";
import { statusColumns, type StatusColumn } from "../db/schema";
import { DuplicateError } from "../lib/errors";

// This service does not perform RBAC checks on users/workspaces before
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
  workspaceId: string;
  userId: string;
}): Promise<StatusColumn> => {
  try {
    return db
      .insert(statusColumns)
      .values({
        ...data,
        createdById: userId,
        // Set the order to the maximum order + 1, or 0 if there are no status
        // columns for this workspace.
        order: sql`COALESCE((SELECT MAX(${statusColumns.order}) + 1 FROM ${statusColumns} WHERE ${statusColumns.workspaceId} = ${data.workspaceId}), 0)`,
      })
      .returning()
      .execute()
      .then((rows) => rows[0]);
  } catch (e: any) {
    if (e.code === "23505") {
      throw new DuplicateError("name");
    }
    throw e;
  }
};

// export const updateStatusColumn = async (

export const getStatusColumn = async (
  workspaceId: string,
  id: string,
): Promise<StatusColumn | null> => {
  return db.query.statusColumns
    .findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.workspaceId, workspaceId), eq(table.id, id)),
    })
    .execute()
    .then((row) => row ?? null);
};

/**
 * Get all status columns for a workspace.
 *
 * @param workspaceId - The workspace ID.
 * @returns A list of status columns.
 *
 * @throws {NotFoundError} If the workspace does not exist.
 */
export const getStatusColumns = async (
  workspaceId: string,
): Promise<StatusColumn[]> => {
  return db.query.statusColumns
    .findMany({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
      orderBy: (table, { asc }) => asc(table.order),
    })
    .execute();
};

export const updateStatusColumn = async (
  workspaceId: string,
  id: string,
  data: UpdateStatusColumnInput,
): Promise<StatusColumn | null> => {
  const row = await db.transaction(async (tx) => {
    // TODO: we can optimize this by only executing the query if the order is
    // being updated.
    const current = await tx.query.statusColumns
      .findFirst({
        where: (table, { eq, and }) =>
          and(eq(table.workspaceId, workspaceId), eq(table.id, id)),
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
              eq(statusColumns.workspaceId, workspaceId),
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
              eq(statusColumns.workspaceId, workspaceId),
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
      .where(
        and(
          eq(statusColumns.workspaceId, workspaceId),
          eq(statusColumns.id, id),
        ),
      )
      .returning()
      .execute()
      .then((rows) => rows[0]);
  });

  return row;
};

export const deleteStatusColumn = async (
  workspaceId: string,
  id: string,
): Promise<boolean> => {
  return await db.transaction(async (tx) => {
    const current = await tx.query.statusColumns
      .findFirst({
        where: (table, { eq, and }) =>
          and(eq(table.workspaceId, workspaceId), eq(table.id, id)),
      })
      .execute();

    if (!current) return false;

    const deleted = await tx
      .delete(statusColumns)
      .where(
        and(
          eq(statusColumns.workspaceId, workspaceId),
          eq(statusColumns.id, id),
        ),
      )
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
          eq(statusColumns.workspaceId, workspaceId),
          gt(statusColumns.order, current.order),
        ),
      )
      .execute();

    return true;
  });
};
