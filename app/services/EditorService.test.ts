import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EditorService } from './EditorService'
import { PrismaClient } from '@prisma/client'

const mockPrisma = {
  userProject: {
    findUnique: vi.fn(),
  },
  userProjectOperation: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  userPlan: {
    findFirst: vi.fn(),
  },
  userUsageLog: {
    aggregate: vi.fn(),
    count: vi.fn(),
  },
} as unknown as PrismaClient

const mockStorageService = {
  saveAsset: vi.fn(),
  saveCurrent: vi.fn(),
  saveHistory: vi.fn(),
  loadCurrent: vi.fn(),
  loadHistory: vi.fn(),
}

const mockAIService = {
  interpretInstruction: vi.fn(),
}

const mockUsageService = {
  recordUsage: vi.fn(),
}

describe('EditorService', () => {
  let editorService: EditorService

  beforeEach(() => {
    vi.clearAllMocks()
    editorService = new EditorService(
      mockPrisma,
      mockStorageService as any,
      mockAIService as any,
      mockUsageService as any
    )
  })

  describe('uploadAsset', () => {
    it('should upload and validate image file', async () => {
      const projectId = 'project-uuid-1'
      const fileName = 'test-image.png'
      const fileData = Buffer.from('fake-image-data')
      const mimeType = 'image/png'

      mockPrisma.userProject.findUnique.mockResolvedValue({
        id: projectId,
        user_id: 'user-1',
        name: 'Test Project',
        description: null,
        thumbnail: null,
        storage_path: 'projects/user-1/project-1',
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Mock PlanService check
      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue({
        id: 'user-plan-1',
        user_id: 'user-1',
        plan_id: 'plan-1',
        start_date: new Date(),
        end_date: null,
        plan: {
          id: 'plan-1',
          name: '無料プラン',
          description: null,
          price: 0,
          max_storage: 100,
          max_ai_calls: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      } as any)

      vi.mocked(mockPrisma.userUsageLog.aggregate).mockResolvedValue({
        _sum: {
          storage_used: 10,
        },
      } as any)

      mockStorageService.saveAsset.mockResolvedValue(
        'storages/storage1/projects/user-1/project-1/assets/test-image.png'
      )

      const result = await editorService.uploadAsset(
        projectId,
        fileName,
        fileData,
        mimeType
      )

      expect(mockStorageService.saveAsset).toHaveBeenCalled()
      expect(result).toContain('assets')
      expect(result).toContain(fileName)
    })

    it('should reject unsupported file format', async () => {
      const projectId = 'project-uuid-1'
      const fileName = 'test.bmp'
      const fileData = Buffer.from('fake-image-data')
      const mimeType = 'image/bmp'

      await expect(
        editorService.uploadAsset(projectId, fileName, fileData, mimeType)
      ).rejects.toThrow('Unsupported file format')
    })

    it('should warn when file size exceeds 10MB', async () => {
      const projectId = 'project-uuid-1'
      const fileName = 'large-image.png'
      const fileData = Buffer.alloc(11 * 1024 * 1024) // 11MB
      const mimeType = 'image/png'

      await expect(
        editorService.uploadAsset(projectId, fileName, fileData, mimeType)
      ).rejects.toThrow('File size exceeds 10MB')
    })
  })

  describe('applyEditing', () => {
    it('should apply editing action and save to history', async () => {
      const userId = 'user-uuid-1'
      const projectId = 'project-uuid-1'
      const instruction = '画像を明るくしてください'
      const aiModelId = 'model-uuid-1'
      const currentImageData = Buffer.from('current-image-data')

      // Mock PlanService check for AI call limit
      vi.mocked(mockPrisma.userPlan.findFirst).mockResolvedValue({
        id: 'user-plan-1',
        user_id: userId,
        plan_id: 'plan-1',
        start_date: new Date(),
        end_date: null,
        plan: {
          id: 'plan-1',
          name: '無料プラン',
          description: null,
          price: 0,
          max_storage: 100,
          max_ai_calls: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      } as any)

      vi.mocked(mockPrisma.userUsageLog.count).mockResolvedValue(5)

      mockPrisma.userProject.findUnique.mockResolvedValue({
        id: projectId,
        user_id: userId,
        name: 'Test Project',
        description: null,
        thumbnail: null,
        storage_path: 'projects/user-1/project-1',
        created_at: new Date(),
        updated_at: new Date(),
      })

      mockPrisma.userProjectOperation.count.mockResolvedValue(0)

      mockAIService.interpretInstruction.mockResolvedValue({
        action: 'adjust_brightness',
        parameters: { brightness: 20 },
      })

      mockStorageService.loadCurrent.mockResolvedValue(currentImageData)
      mockStorageService.saveHistory.mockResolvedValue(
        'storages/storage1/projects/user-1/project-1/history/1.png'
      )
      mockStorageService.saveCurrent.mockResolvedValue(
        'storages/storage1/projects/user-1/project-1/current/current.png'
      )

      const mockOperation = {
        id: 'operation-uuid-1',
        user_id: userId,
        user_project_id: projectId,
        operation_type: 'ai_edit',
        prompt: instruction,
        result_path: 'current/current.png',
        ai_model_id: aiModelId,
        created_at: new Date(),
      }

      mockPrisma.userProjectOperation.create.mockResolvedValue(mockOperation)

      const result = await editorService.applyEditing(
        userId,
        projectId,
        instruction,
        aiModelId
      )

      expect(mockAIService.interpretInstruction).toHaveBeenCalledWith(
        instruction,
        aiModelId
      )
      expect(mockStorageService.saveHistory).toHaveBeenCalled()
      expect(mockStorageService.saveCurrent).toHaveBeenCalled()
      expect(mockPrisma.userProjectOperation.create).toHaveBeenCalled()
      expect(mockUsageService.recordUsage).toHaveBeenCalledWith(
        userId,
        'ai_call',
        1,
        aiModelId
      )
      expect(result).toEqual(mockOperation)
    })
  })

  describe('getOperations', () => {
    it('should return operations history in chronological order', async () => {
      const projectId = 'project-uuid-1'

      const mockOperations = [
        {
          id: 'op-1',
          user_id: 'user-1',
          user_project_id: projectId,
          operation_type: 'ai_edit',
          prompt: '明るくする',
          result_path: 'current/current.png',
          ai_model_id: 'model-1',
          created_at: new Date('2025-01-01'),
        },
        {
          id: 'op-2',
          user_id: 'user-1',
          user_project_id: projectId,
          operation_type: 'ai_edit',
          prompt: 'コントラストを上げる',
          result_path: 'current/current.png',
          ai_model_id: 'model-1',
          created_at: new Date('2025-01-02'),
        },
      ]

      mockPrisma.userProjectOperation.findMany.mockResolvedValue(mockOperations)

      const result = await editorService.getOperations(projectId)

      expect(mockPrisma.userProjectOperation.findMany).toHaveBeenCalledWith({
        where: { user_project_id: projectId },
        orderBy: { created_at: 'asc' },
      })
      expect(result).toEqual(mockOperations)
    })
  })

  describe('exportImage', () => {
    it('should export current image in specified format', async () => {
      const projectId = 'project-uuid-1'
      const format = 'png'
      const currentImageData = Buffer.from('current-image-data')

      mockPrisma.userProject.findUnique.mockResolvedValue({
        id: projectId,
        user_id: 'user-1',
        name: 'Test Project',
        description: null,
        thumbnail: null,
        storage_path: 'projects/user-1/project-1',
        created_at: new Date(),
        updated_at: new Date(),
      })

      mockStorageService.loadCurrent.mockResolvedValue(currentImageData)

      const result = await editorService.exportImage(projectId, format)

      expect(mockStorageService.loadCurrent).toHaveBeenCalled()
      expect(result).toEqual(currentImageData)
    })

    it('should reject unsupported export format', async () => {
      const projectId = 'project-uuid-1'
      const format = 'bmp'

      await expect(
        editorService.exportImage(projectId, format)
      ).rejects.toThrow('Unsupported export format')
    })
  })
})
