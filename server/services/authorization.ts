import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../db/db";
import {
  attachments,
  boards,
  collaborators,
  labels,
  tasks,
  type Board,
  type User,
} from "../db/schema";

/**
 * Check if a user is the owner of a board.
 *
 * @param userId The user ID.
 * @param boardId The board ID.
 */
export const isUserBoardOwner = (userId: string, boardId: string) =>
  db
    .select({ res: sql`1` })
    .from(boards)
    .where(and(eq(boards.ownerId, userId), eq(boards.id, boardId)))
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

/**
 * Check if a user is a collaborator or owner of a board.
 *
 * @param userId The user ID.
 * @param boardId The board ID.
 */
export const isUserBoardCollaborator = (userId: string, boardId: string) =>
  db
    .select({ res: sql`1` })
    .from(boards)
    .leftJoin(collaborators, eq(collaborators.boardId, boardId))
    .where(
      and(
        eq(boards.id, boardId),
        or(eq(collaborators.userId, userId), eq(boards.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

export const isUserBoardCollaboratorForAttachment = (
  userId: string,
  attachmentId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(attachments)
    .leftJoin(tasks, eq(tasks.id, attachments.taskId))
    .leftJoin(boards, eq(boards.id, tasks.boardId))
    .leftJoin(collaborators, eq(collaborators.boardId, tasks.boardId))
    .where(
      and(
        eq(attachments.id, attachmentId),
        or(eq(collaborators.userId, userId), eq(boards.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

/**
 * Check if a user is a collaborator or owner of the board that a task
 * belongs to.
 *
 * @param userId The user ID.
 * @param taskId The task ID.
 */
export const isUserBoardCollaboratorForTask = (
  userId: string,
  taskId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(tasks)
    .leftJoin(boards, eq(boards.id, tasks.boardId))
    .leftJoin(collaborators, eq(collaborators.boardId, tasks.boardId))
    .where(
      and(
        eq(tasks.id, taskId),
        or(eq(collaborators.userId, userId), eq(boards.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

export const isUserBoardCollaboratorForLabel = (
  userId: string,
  labelId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(labels)
    .leftJoin(boards, eq(boards.id, labels.boardId))
    .leftJoin(collaborators, eq(collaborators.boardId, labels.boardId))
    .where(
      and(
        eq(labels.id, labelId),
        or(eq(collaborators.userId, userId), eq(boards.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

// ...

export async function isUserAllowedToEditBoard(
  user: User,
  board: Board,
): Promise<boolean> {
  return board.ownerId === user.id;
}

export async function isUserAllowedToViewBoard(
  user: User,
  board: Board | string,
): Promise<boolean> {
  const boardId = typeof board === "string" ? board : board.id;

  if (typeof board !== "string" && board.ownerId === user.id) {
    return true;
  }

  return isUserBoardCollaborator(user.id, boardId);
}

export async function isUserAllowedToDeleteBoard(
  user: User,
  board: Board,
): Promise<boolean> {
  return board.ownerId === user.id;
}

export async function isUserAllowedToModifyLabel(
  userId: string,
  labelId: string,
): Promise<boolean> {
  // Currently, only board owners can modify labels.
  return db
    .select({ res: sql`1` })
    .from(labels)
    .leftJoin(boards, eq(boards.id, labels.boardId))
    .where(and(eq(labels.id, labelId), eq(boards.ownerId, userId)))
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);
}

export async function isUserAllowedToCreateOrModifyBoardInvitation(
  userId: string,
  boardId: string,
): Promise<boolean> {
  return isUserBoardOwner(userId, boardId);
}

export async function isUserAllowedToCreateOrModifyColumns(
  userId: string,
  boardId: string,
): Promise<boolean> {
  return isUserBoardCollaborator(userId, boardId);
}

export async function isUserAllowedToDeleteAttachment(
  _userId: string,
  _attachmentId: string,
): Promise<boolean> {
  return true;
}
