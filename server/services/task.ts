import { and, eq, sql } from "drizzle-orm";
import { type UpdateTaskInput } from "~/lib/validation";
import { db } from "../db/db";
import {
  Assignee,
  assignees,
  tasks,
  type NewTask,
  type TaskWithAssignees,
} from "../db/schema";
import { DuplicateError, NotFoundError } from "../lib/errors";

export const createTask = async (data: NewTask): Promise<TaskWithAssignees> => {
  return db
    .insert(tasks)
    .values(data)
    .returning()
    .execute()
    .then((task) => ({ ...task[0], assignees: [] }));
};

export const getTaskById = async (
  id: string,
): Promise<TaskWithAssignees | null> => {
  return db.query.tasks
    .findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        assignees: true,
      },
    })
    .execute()
    .then((task) => task ?? null);
};

export const getTasksForStatusColumn = async (
  workspaceId: string,
  statusColumnId: string,
): Promise<TaskWithAssignees[]> => {
  return db.query.tasks
    .findMany({
      where: (table, { eq, and }) =>
        and(
          eq(table.statusColumnId, statusColumnId),
          eq(table.workspaceId, workspaceId),
        ),
      with: {
        assignees: true,
      },
      // Most recently created tasks first
      orderBy: (table, { desc }) => desc(table.createdAt),
    })
    .execute();
};

export const updateTask = async (
  id: string,
  userId: string,
  data: UpdateTaskInput,
): Promise<TaskWithAssignees | null> => {
  // We can use the following query to update a task and return it along with
  // its assignees, however, I cannot find a way to do this with drizzle.
  // Drizzle does not seem to support update statements as CTEs.
  //
  // WITH updated AS (
  // 	UPDATE
  // 		tasks
  // 	SET
  // 		workspace_id = 'b1c79cb1-9a36-4859-b630-39bb25e5f534'
  // 	WHERE
  // 		id = 'e5654d44-37a8-4c88-88f4-509f4ddf25f8'
  // 	RETURNING
  // 		*
  // )
  // SELECT
  // 	*
  // FROM
  // 	updated
  // 	LEFT JOIN assignees a ON a.task_id = updated.id

  const [task, assignees] = await Promise.all([
    db
      .update(tasks)
      .set({
        ...data,
        lastUpdatedById: userId,
        updatedAt: sql`now()`,
      })
      .where(eq(tasks.id, id))
      .returning()
      .execute()
      .then((task) => task[0] ?? null),
    db.query.assignees
      .findMany({
        where: (table, { eq }) => eq(table.taskId, id),
      })
      .execute(),
  ]);

  return task ? { ...task, assignees } : null;
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
  } catch (e: any) {
    // Check if constraint violation error (Task does not exist).
    if (e.code === "23503") {
      throw new NotFoundError("Task not found");
    } else if (e.code === "23505") {
      throw new DuplicateError("userId", "User is already assigned to task");
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
