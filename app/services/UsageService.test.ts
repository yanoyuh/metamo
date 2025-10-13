import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UsageService } from './UsageService'
import { PrismaClient } from '@prisma/client'

const mockPrisma = {
  userPlan: {
    findFirst: vi.fn(),
  },
  userUsageLog: {
    create: vi.fn(),
    aggregate: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
  },
} as unknown as PrismaClient

describe('UsageService', () => {
  let usageService: UsageService

  beforeEach(() => {
    vi.clearAllMocks()
    usageService = new UsageService(mockPrisma)
  })

  describe('getCurrentPlan', () => {
    it('should return current user plan with details', async () => {
      const userId = 'user-uuid-1'
      const mockUserPlan = {
        id: 'user-plan-uuid-1',
        user_id: userId,
        plan_id: 'plan-uuid-1',
        started_at: new Date(),
        ended_at: null,
        created_at: new Date(),
        updated_at: new Date(),
        plan: {
          id: 'plan-uuid-1',
          name: 'プロプラン',
          description: 'すべての機能を無制限で利用',
          price: 980,
          max_storage: 10000,
          max_ai_calls: 1000,
          created_at: new Date(),
          updated_at: new Date(),
        },
      }

      mockPrisma.userPlan.findFirst.mockResolvedValue(mockUserPlan)

      const result = await usageService.getCurrentPlan(userId)

      expect(mockPrisma.userPlan.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          ended_at: null,
        },
        include: {
          plan: true,
        },
      })
      expect(result).toEqual(mockUserPlan)
    })

    it('should return null when no active plan', async () => {
      mockPrisma.userPlan.findFirst.mockResolvedValue(null)

      const result = await usageService.getCurrentPlan('user-uuid-1')

      expect(result).toBeNull()
    })
  })

  describe('recordUsage', () => {
    it('should record AI usage', async () => {
      const userId = 'user-uuid-1'
      const aiModelId = 'ai-model-uuid-1'
      const usageCount = 1

      const mockUsageLog = {
        id: 'usage-log-uuid-1',
        user_id: userId,
        usage_type: 'ai_call',
        usage_count: usageCount,
        usage_size: null,
        ai_model_id: aiModelId,
        created_at: new Date(),
      }

      mockPrisma.userUsageLog.create.mockResolvedValue(mockUsageLog)

      const result = await usageService.recordUsage(
        userId,
        'ai_call',
        usageCount,
        aiModelId
      )

      expect(mockPrisma.userUsageLog.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          usage_type: 'ai_call',
          usage_count: usageCount,
          ai_model_id: aiModelId,
        },
      })
      expect(result).toEqual(mockUsageLog)
    })

    it('should record storage usage with size', async () => {
      const userId = 'user-uuid-1'
      const usageSize = 50

      const mockUsageLog = {
        id: 'usage-log-uuid-1',
        user_id: userId,
        usage_type: 'storage',
        usage_count: 1,
        usage_size: usageSize,
        ai_model_id: null,
        created_at: new Date(),
      }

      mockPrisma.userUsageLog.create.mockResolvedValue(mockUsageLog)

      const result = await usageService.recordUsage(
        userId,
        'storage',
        1,
        undefined,
        usageSize
      )

      expect(mockPrisma.userUsageLog.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          usage_type: 'storage',
          usage_count: 1,
          usage_size: usageSize,
        },
      })
      expect(result).toEqual(mockUsageLog)
    })
  })

  describe('getUsageSummary', () => {
    it('should return usage summary for current month', async () => {
      const userId = 'user-uuid-1'

      mockPrisma.userUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { usage_count: 50 },
      })

      mockPrisma.userUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { usage_size: 200 },
      })

      const result = await usageService.getUsageSummary(userId)

      expect(result).toEqual({
        ai_calls: 50,
        storage_mb: 200,
      })
    })

    it('should return zero when no usage data', async () => {
      mockPrisma.userUsageLog.aggregate.mockResolvedValue({
        _sum: { usage_count: null, usage_size: null },
      })

      const result = await usageService.getUsageSummary('user-uuid-1')

      expect(result).toEqual({
        ai_calls: 0,
        storage_mb: 0,
      })
    })
  })
})
