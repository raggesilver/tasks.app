import { eq, sql } from "drizzle-orm";
import { db } from "../db/db";
import { type Label, labels, type NewLabel } from "../db/schema";

export const createLabel = async (data: NewLabel): Promise<Label> => {
  return db
    .insert(labels)
    .values(data)
    .returning()
    .execute()
    .then((label) => label[0]);
};

export const getLabelById = async (id: string): Promise<Label | null> => {
  return db.query.labels
    .findFirst({
      where: (table, { eq }) => eq(table.id, id),
    })
    .execute()
    .then((label) => label ?? null);
};

export const getLabelsForBoard = async (boardId: string): Promise<Label[]> => {
  return db.query.labels
    .findMany({
      where: (table, { eq }) => eq(table.boardId, boardId),
    })
    .execute();
};

export const updateLabel = async (
  id: string,
  data: Partial<NewLabel>,
): Promise<Label> => {
  return db
    .update(labels)
    .set(data)
    .where(eq(labels.id, id))
    .returning()
    .execute()
    .then((label) => label[0]);
};

export const deleteLabel = async (id: string): Promise<boolean> => {
  return db
    .delete(labels)
    .where(eq(labels.id, id))
    .returning({ id: sql`1` })
    .execute()
    .then((res) => res.length > 0);
};
