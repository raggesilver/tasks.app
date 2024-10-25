import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../db/db";
import {
  attachments,
  boards,
  collaborators,
  labels,
  tasks,
  workspaces,
  type Board,
  type User,
  type Workspace,
} from "../db/schema";

export const isUserWorkspaceCollaborator = (
  userId: string,
  workspaceId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(workspaces)
    // FIXME: uncomment this once we have workspace collaborators
    // .leftJoin(collaborators, eq(collaborators.workspaceId, workspaceId))
    .where(
      and(
        eq(workspaces.id, workspaceId),
        or(
          eq(workspaces.ownerId, userId),
          // eq(collaborators.userId, userId),
        ),
      ),
    )
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

/**
 * Check if a user is the owner of a workspace.
 *
 * @param userId The user ID.
 * @param workspaceId The workspace ID.
 */
export const isUserWorkspaceOwner = (userId: string, workspaceId: string) =>
  db
    .select({ res: sql`1` })
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)))
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

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
 * Check if a user is a collaborator or owner of the board that a task belongs
 * to.
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

export async function isUserAllowedToViewWorkspace(
  user: User | string,
  workspace: Workspace | string,
): Promise<boolean> {
  const userId = typeof user === "string" ? user : user.id;
  const workspaceId = typeof workspace === "string" ? workspace : workspace.id;

  return isUserWorkspaceCollaborator(userId, workspaceId);
}

export async function isUserAllowedToModifyWorkspace(
  user: User | string,
  workspace: Workspace | string,
): Promise<boolean> {
  const userId = typeof user === "string" ? user : user.id;

  if (typeof workspace !== "string") {
    return workspace.ownerId === userId;
  }

  return isUserWorkspaceOwner(userId, workspace);
}

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
