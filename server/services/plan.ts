import { db } from "../db/db";
import { plans, type NewPlan, type Plan } from "../db/schema";

class PlanService {
  @cacheResult(60 * 60 * 24)
  async getPlanForWorkspace(workspaceId: string): Promise<Plan | null> {
    return db.query.plans
      .findFirst({ where: (t, { eq }) => eq(t.workspaceId, workspaceId) })
      .execute()
      .then((plan) => plan ?? null);
  }

  async setPlanForWorkspace(
    workspaceId: string,
    plan: Omit<NewPlan, "workspaceId">,
  ): Promise<Plan> {
    const [_plan] = await db
      .insert(plans)
      .values({ ...plan, workspaceId })
      .onConflictDoNothing()
      .returning()
      .execute();

    invalidateCache(getCacheKey(this.getPlanForWorkspace, [workspaceId]));

    return _plan;
  }
}

export const planService = new PlanService();
