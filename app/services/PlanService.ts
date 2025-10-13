import type { PrismaClient, Plan, UserPlan } from '@prisma/client'

export class PlanService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all available plans
   */
  async getAllPlans(): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      orderBy: {
        price: 'asc',
      },
    })
  }

  /**
   * Get user's current plan
   */
  async getUserPlan(userId: string): Promise<(UserPlan & { plan: Plan }) | null> {
    return this.prisma.userPlan.findFirst({
      where: {
        user_id: userId,
        end_date: null, // Active plan
      },
      include: {
        plan: true,
      },
    })
  }

  /**
   * Change user's plan
   */
  async changePlan(userId: string, newPlanId: string): Promise<UserPlan> {
    // End current plan
    await this.prisma.userPlan.updateMany({
      where: {
        user_id: userId,
        end_date: null,
      },
      data: {
        end_date: new Date(),
      },
    })

    // Create new plan
    return this.prisma.userPlan.create({
      data: {
        user_id: userId,
        plan_id: newPlanId,
        start_date: new Date(),
      },
    })
  }

  /**
   * Check if user has exceeded storage limit
   */
  async checkStorageLimit(userId: string, additionalSize: number): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId)
    if (!userPlan) {
      throw new Error('User plan not found')
    }

    const usageSummary = await this.prisma.userUsageLog.aggregate({
      where: {
        user_id: userId,
      },
      _sum: {
        storage_used: true,
      },
    })

    const currentUsage = usageSummary._sum.storage_used || 0
    const newUsage = currentUsage + additionalSize

    return newUsage <= userPlan.plan.max_storage
  }

  /**
   * Check if user has exceeded AI call limit for the current month
   */
  async checkAiCallLimit(userId: string): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId)
    if (!userPlan) {
      throw new Error('User plan not found')
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const usageCount = await this.prisma.userUsageLog.count({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfMonth,
        },
      },
    })

    return usageCount < userPlan.plan.max_ai_calls
  }

  /**
   * Get usage statistics for the current month
   */
  async getUsageStats(userId: string): Promise<{
    storageUsed: number
    aiCallsUsed: number
    maxStorage: number
    maxAiCalls: number
  }> {
    const userPlan = await this.getUserPlan(userId)
    if (!userPlan) {
      throw new Error('User plan not found')
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const usageSummary = await this.prisma.userUsageLog.aggregate({
      where: {
        user_id: userId,
      },
      _sum: {
        storage_used: true,
      },
    })

    const aiCallsCount = await this.prisma.userUsageLog.count({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfMonth,
        },
      },
    })

    return {
      storageUsed: usageSummary._sum.storage_used || 0,
      aiCallsUsed: aiCallsCount,
      maxStorage: userPlan.plan.max_storage,
      maxAiCalls: userPlan.plan.max_ai_calls,
    }
  }
}
