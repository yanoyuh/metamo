import { PrismaClient, UserUsageLog } from '@prisma/client'

export class UsageService {
  constructor(private prisma: PrismaClient) {}

  async getCurrentPlan(userId: string) {
    const userPlan = await this.prisma.userPlan.findFirst({
      where: {
        user_id: userId,
        ended_at: null,
      },
      include: {
        plan: true,
      },
    })

    return userPlan
  }

  async recordUsage(
    userId: string,
    usageType: string,
    usageCount: number = 1,
    aiModelId?: string,
    usageSize?: number
  ): Promise<UserUsageLog> {
    const usageLog = await this.prisma.userUsageLog.create({
      data: {
        user_id: userId,
        usage_type: usageType,
        usage_count: usageCount,
        ai_model_id: aiModelId,
        usage_size: usageSize,
      },
    })

    return usageLog
  }

  async getUsageSummary(userId: string): Promise<{
    ai_calls: number
    storage_mb: number
  }> {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // AI呼び出し回数の集計
    const aiCallsResult = await this.prisma.userUsageLog.aggregate({
      where: {
        user_id: userId,
        usage_type: 'ai_call',
        created_at: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        usage_count: true,
      },
    })

    // ストレージ使用量の集計
    const storageResult = await this.prisma.userUsageLog.aggregate({
      where: {
        user_id: userId,
        usage_type: 'storage',
        created_at: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        usage_size: true,
      },
    })

    return {
      ai_calls: aiCallsResult._sum.usage_count || 0,
      storage_mb: storageResult._sum.usage_size || 0,
    }
  }
}
