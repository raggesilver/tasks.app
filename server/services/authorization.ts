import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../db/db";
import {
  attachments,
  boards,
  collaborators,
  labels,
  tasks,
  workspaceCollaborators,
  workspaces,
  type Board,
  type User,
  type Workspace,
} from "../db/schema";

// FIXME: there's currently a big issue with board ownership. In most cases,
// board owners are given more permission than workspace owners. This is not
// right. Also, we are giving users access to boards and anything they contain
// simply because they created the board. This is also not right. Users who
// created boards and were later removed from the board (or workspace) should
// not have access to the board or anything it contains. This is a security
// issue.

export const isUserWorkspaceCollaborator = (
  userId: string,
  workspaceId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(workspaces)
    .leftJoin(
      workspaceCollaborators,
      eq(workspaceCollaborators.workspaceId, workspaceId),
    )
    .where(
      and(
        eq(workspaces.id, workspaceId),
        or(
          eq(workspaces.ownerId, userId),
          eq(workspaceCollaborators.userId, userId),
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
    .leftJoin(
      workspaceCollaborators,
      eq(workspaceCollaborators.workspaceId, userId),
    )
    .where(
      and(
        eq(boards.id, boardId),
        or(
          // User is a direct board collaborator
          eq(collaborators.userId, userId),
          // User is the board owner
          eq(boards.ownerId, userId),
          // User is a collaborator of the workspace the board belongs to
          eq(workspaceCollaborators.workspaceId, boards.workspaceId),
        ),
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
    .leftJoin(collaborators, eq(collaborators.boardId, boards.id))
    .leftJoin(
      workspaceCollaborators,
      eq(workspaceCollaborators.workspaceId, boards.workspaceId),
    )
    .where(
      and(
        eq(attachments.id, attachmentId),
        or(
          eq(boards.ownerId, userId),
          eq(collaborators.userId, userId),
          eq(workspaceCollaborators.userId, userId),
        ),
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
    .leftJoin(
      workspaceCollaborators,
      eq(workspaceCollaborators.workspaceId, boards.workspaceId),
    )
    .where(
      and(
        eq(tasks.id, taskId),
        or(
          eq(collaborators.userId, userId),
          eq(boards.ownerId, userId),
          eq(workspaceCollaborators.userId, userId),
        ),
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
    .leftJoin(
      workspaceCollaborators,
      eq(workspaceCollaborators.workspaceId, boards.workspaceId),
    )
    .where(
      and(
        eq(labels.id, labelId),
        or(
          eq(collaborators.userId, userId),
          eq(boards.ownerId, userId),
          eq(workspaceCollaborators.userId, userId),
        ),
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
