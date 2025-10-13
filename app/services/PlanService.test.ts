import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PlanService } from './PlanService'
import type { PrismaClient } from '@prisma/client'

const mockPrisma = {
  plan: {
    findMany: vi.fn(),
  },
  userPlan: {
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    create: vi.fn(),
  },
  userUsageLog: {
    aggregate: vi.fn(),
    count: vi.fn(),
  },
} as unknown as PrismaClient

describe('PlanService', () => {
  let planService: PlanService

  beforeEach(() => {
    vi.clearAllMocks()
    planService = new PlanService(mockPrisma)
  })

  describe('getAllPlans', () => {
    it('should return all available plans', async () => {
      const mockPlans = [
        { id: '1', name: '無料プラン', price: 0, max_storage: 100, max_ai_calls: 10 },
        { id: '2', name: 'プロプラン', price: 980, max_storage: 10000, max_ai_calls: 1000 },
      ]

      vi.mocked(mockPrisma.plan.findMany).mockResolvedValue(mockPlans as any)

      const plans = await planService.getAllPlans()

      expect(plans).toEqual(mockPlans)
      expect(mockPrisma.plan.findMany).toHaveBeenCalledWith({
        orderBy: {
          price: 'asc',
        },
      })
    })
  })

  describe('getUserPlan', () => {
    it('should return user\'s current active plan', async () => {
      const mockUserPlan = {
        id: '1',
        user_id: 'user-1',
        plan_id: 'plan-1',
        start_date: new Date(),
        end_date: null,
        plan: {
          id: 'plan-1',
          name: '無料プラン',
          price: 0,
          max_storage: 100,
          max_ai_calls: 10,
        },
      }

      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue(mockUserPlan as any)

      const userPlan = await planService.getUserPlan('user-1')

      expect(userPlan).toEqual(mockUserPlan)
      expect(mockPrisma.userPlan.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          end_date: null,
        },
        include: {
          plan: true,
        },
      })
    })
  })

  describe('changePlan', () => {
    it('should end current plan and create new plan', async () => {
      const mockNewPlan = {
        id: '2',
        user_id: 'user-1',
        plan_id: 'plan-2',
        start_date: new Date(),
        end_date: null,
      }

      vi.mocked(mockPrisma.userPlan.updateMany).mockResolvedValue({ count: 1 } as any)
      vi.mocked(mockPrisma.userPlan.create).mockResolvedValue(mockNewPlan as any)

      const result = await planService.changePlan('user-1', 'plan-2')

      expect(result).toEqual(mockNewPlan)
      expect(mockPrisma.userPlan.updateMany).toHaveBeenCalled()
      expect(mockPrisma.userPlan.create).toHaveBeenCalled()
    })
  })

  describe('checkStorageLimit', () => {
    it('should return true if within storage limit', async () => {
      const mockUserPlan = {
        plan: {
          max_storage: 100,
        },
      }

      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue(mockUserPlan as any)
      vi.mocked(mockPrisma.userUsageLog.aggregate).mockResolvedValue({
        _sum: {
          storage_used: 50,
        },
      } as any)

      const result = await planService.checkStorageLimit('user-1', 30)

      expect(result).toBe(true)
    })

    it('should return false if exceeds storage limit', async () => {
      const mockUserPlan = {
        plan: {
          max_storage: 100,
        },
      }

      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue(mockUserPlan as any)
      vi.mocked(mockPrisma.userUsageLog.aggregate).mockResolvedValue({
        _sum: {
          storage_used: 80,
        },
      } as any)

      const result = await planService.checkStorageLimit('user-1', 30)

      expect(result).toBe(false)
    })
  })

  describe('checkAiCallLimit', () => {
    it('should return true if within AI call limit', async () => {
      const mockUserPlan = {
        plan: {
          max_ai_calls: 10,
        },
      }

      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue(mockUserPlan as any)
      vi.mocked(mockPrisma.userUsageLog.count).mockResolvedValue(5)

      const result = await planService.checkAiCallLimit('user-1')

      expect(result).toBe(true)
    })

    it('should return false if exceeds AI call limit', async () => {
      const mockUserPlan = {
        plan: {
          max_ai_calls: 10,
        },
      }

      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue(mockUserPlan as any)
      vi.mocked(mockPrisma.userUsageLog.count).mockResolvedValue(10)

      const result = await planService.checkAiCallLimit('user-1')

      expect(result).toBe(false)
    })
  })

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const mockUserPlan = {
        plan: {
          max_storage: 100,
          max_ai_calls: 10,
        },
      }

      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue(mockUserPlan as any)
      vi.mocked(mockPrisma.userUsageLog.aggregate).mockResolvedValue({
        _sum: {
          storage_used: 50,
        },
      } as any)
      vi.mocked(mockPrisma.userUsageLog.count).mockResolvedValue(5)

      const stats = await planService.getUsageStats('user-1')

      expect(stats).toEqual({
        storageUsed: 50,
        aiCallsUsed: 5,
        maxStorage: 100,
        maxAiCalls: 10,
      })
    })
  })
})
