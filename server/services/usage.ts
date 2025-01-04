import { eq, or, sql } from "drizzle-orm";
import { db } from "../db/db";
import {
  boards,
  collaborators,
  users,
  workspaceCollaborators,
} from "../db/schema";

class UsageService {
  @cacheResult(60 * 60)
  async getCollaboratorUsage(
    workspaceId: string,
  ): Promise<{ inUse: number; limit: number }> {
    const distinctCollaborators = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${users.id})`,
      })
      .from(users)
      .leftJoin(
        workspaceCollaborators,
        eq(users.id, workspaceCollaborators.userId),
      )
      .leftJoin(collaborators, eq(users.id, collaborators.userId))
      .leftJoin(boards, eq(collaborators.boardId, boards.id))
      .where(
        or(
          eq(workspaceCollaborators.workspaceId, workspaceId),
          eq(boards.workspaceId, workspaceId),
        ),
      );

    // FIXME: we don't have plans or anything, so we just return 100.
    const limit = 100;

    return { inUse: distinctCollaborators[0].count, limit };
  }
}

export const usageService = new UsageService();
