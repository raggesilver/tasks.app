import { eq } from "drizzle-orm";
import { type UpdateTaskInput } from "~/lib/validation";
import { db } from "../db/db";
import { tasks, type NewTask, type Task } from "../db/schema";

export const createTask = async (data: NewTask): Promise<Task> => {
  return db
    .insert(tasks)
    .values(data)
    .returning()
    .execute()
    .then((task) => task[0]);
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  return db.query.tasks
    .findFirst({
      where: (table, { eq }) => eq(table.id, id),
    })
    .execute()
    .then((task) => task ?? null);
};

export const getTasksForStatusColumn = async (
  workspaceId: string,
  statusColumnId: string,
): Promise<Task[]> => {
  return db.query.tasks
    .findMany({
      where: (table, { eq, and }) =>
        and(
          eq(table.statusColumnId, statusColumnId),
          eq(table.workspaceId, workspaceId),
        ),
      // Most recently created tasks first
      orderBy: (table, { desc }) => desc(table.createdAt),
    })
    .execute();
};

export const updateTask = async (
  id: string,
  userId: string,
  data: UpdateTaskInput,
): Promise<Task | null> => {
  return db
    .update(tasks)
    .set({
      ...data,
      lastUpdatedById: userId,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning()
    .execute()
    .then((task) => task[0] ?? null);
};

export const deleteTask = async (id: string): Promise<boolean> => {
  return db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning()
    .execute()
    .then((result) => result.length > 0);
};
