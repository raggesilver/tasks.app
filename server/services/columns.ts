import { and, eq } from "drizzle-orm";
import { PostgresError } from "postgres";
import type {
  CreateStatusColumnInput,
  UpdateStatusColumnInput,
} from "~/lib/validation";
import { db } from "../db/db";
import { StatusColumn, statusColumns } from "../db/schema";
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
}: CreateStatusColumnInput & { userId: string }): Promise<StatusColumn> => {
  try {
    return db
      .insert(statusColumns)
      .values({
        ...data,
        createdById: userId,
      })
      .returning()
      .execute()
      .then((rows) => rows[0]);
  } catch (e) {
    if (e instanceof PostgresError && e.code === "23505") {
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
): Promise<StatusColumn> => {
  return db
    .update(statusColumns)
    .set(data)
    .where(
      and(eq(statusColumns.workspaceId, workspaceId), eq(statusColumns.id, id)),
    )
    .returning()
    .execute()
    .then((rows) => rows[0]);
};

// TODO: Implement deleteStatusColumn
