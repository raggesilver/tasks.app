import { and, eq, sql } from "drizzle-orm";
import type { UpdateTaskInput } from "~/lib/validation";
import { db } from "../db/db";
import {
  assignees,
  taskLabels,
  tasks,
  type Assignee,
  type NewTask,
  type TaskWithEverything,
} from "../db/schema";
import { DuplicateError, isPostgresError, NotFoundError } from "../lib/errors";

export const createTask = async (
  data: NewTask,
): Promise<TaskWithEverything> => {
  return db
    .insert(tasks)
    .values(data)
    .returning()
    .execute()
    .then((task) => ({
      ...task[0],
      assignees: [],
      labels: [],
      attachments: [],
    }));
};

export const getTaskById = async (
  id: string,
): Promise<TaskWithEverything | null> => {
  return db.query.tasks
    .findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        assignees: true,
        labels: true,
        attachments: true,
      },
    })
    .execute()
    .then((task) => task ?? null);
};

export const getTasksForStatusColumn = async (
  workspaceId: string,
  statusColumnId: string,
): Promise<TaskWithEverything[]> => {
  return db.query.tasks
    .findMany({
      where: (table, { eq, and }) =>
        and(
          eq(table.statusColumnId, statusColumnId),
          eq(table.workspaceId, workspaceId),
        ),
      with: {
        assignees: true,
        labels: true,
        attachments: true,
      },
      // Most recently created tasks first
      orderBy: (table, { desc }) =>
        desc(sql`coalesce(${table.updatedAt}, ${table.createdAt})`),
    })
    .execute();
};

export const updateTask = async (
  id: string,
  userId: string,
  data: UpdateTaskInput,
): Promise<TaskWithEverything | null> => {
  // Drizzle does not support update queries as CTEs, so we have to update and
  // then fetch the updated task.
  const task = await db
    .update(tasks)
    .set({
      ...data,
      lastUpdatedById: userId,
      updatedAt: sql`now()`,
    })
    .where(eq(tasks.id, id))
    // TODO: since we are not using the task, we should probably remove this.
    .returning()
    .execute()
    .then((task) => task[0] ?? null);

  return task ? getTaskById(id) : null;
};

export const deleteTask = async (id: string): Promise<boolean> => {
  return db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning()
    .execute()
    .then((result) => result.length > 0);
};

export const addAssigneeToTask = async (
  taskId: string,
  userId: string,
): Promise<Assignee | null> => {
  try {
    return db
      .insert(assignees)
      .values({ taskId, userId })
      .returning()
      .execute()
      .then((assignee) => assignee[0]);
  } catch (e) {
    // Check if constraint violation error (Task does not exist).
    if (isPostgresError(e)) {
      if (e.code === "23503") {
        throw new NotFoundError("Task not found");
      } else if (e.code === "23505") {
        throw new DuplicateError("userId", "User is already assigned to task");
      }
    }
    throw e;
  }
};

export const removeAssigneeFromTask = async (
  taskId: string,
  userId: string,
): Promise<boolean> => {
  return db
    .delete(assignees)
    .where(and(eq(assignees.taskId, taskId), eq(assignees.userId, userId)))
    .returning()
    .execute()
    .then((result) => result.length > 0);
};

export const addLabelToTask = async (
  taskId: string,
  labelId: string,
): Promise<void> => {
  await db
    .insert(taskLabels)
    .values({ taskId, labelId })
    .onConflictDoNothing({
      target: [taskLabels.taskId, taskLabels.labelId],
    })
    .execute();
};

export const removeLabelFromTask = async (
  taskId: string,
  labelId: string,
): Promise<boolean> => {
  return db
    .delete(taskLabels)
    .where(and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)))
    .returning({ id: sql`1` })
    .execute()
    .then((results) => results.length > 0);
};
