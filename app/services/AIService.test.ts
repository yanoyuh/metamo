import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AIService } from './AIService'
import { PrismaClient } from '@prisma/client'

const mockPrisma = {
  aiModel: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
} as unknown as PrismaClient

// 環境変数をモック
vi.mock('@/utils/env', () => ({
  loadEnv: () => ({
    supabaseUrl: 'http://localhost:54321',
    supabaseAnonKey: 'test-key',
    googleApiKey: 'test-google-api-key',
    openaiApiKey: 'test-openai-api-key',
    anthropicApiKey: 'test-anthropic-api-key',
    storageRoot: 'storages/test',
    appUrl: 'http://localhost:3000',
    nodeEnv: 'test',
  }),
}))

// AI SDK のモック
const mockGenerateText = vi.fn()
vi.mock('ai', () => ({
  generateText: (...args: any[]) => mockGenerateText(...args),
}))

vi.mock('@ai-sdk/google', () => ({
  google: () => ({ provider: 'google' }),
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: () => ({ provider: 'openai' }),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => ({ provider: 'anthropic' }),
}))

describe('AIService', () => {
  let aiService: AIService

  beforeEach(() => {
    vi.clearAllMocks()
    aiService = new AIService(mockPrisma)
  })

  describe('getAvailableModels', () => {
    it('should return list of active AI models', async () => {
      const mockModels = [
        {
          id: 'model-1',
          provider: 'google',
          model_name: 'gemini-2.0-flash-exp',
          display_name: 'Google Gemini 2.0 Flash',
          description: 'Fast model',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'model-2',
          provider: 'openai',
          model_name: 'gpt-4o',
          display_name: 'OpenAI GPT-4o',
          description: 'Advanced model',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      mockPrisma.aiModel.findMany.mockResolvedValue(mockModels)

      const result = await aiService.getAvailableModels()

      expect(mockPrisma.aiModel.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
      })
      expect(result).toEqual(mockModels)
    })
  })

  describe('interpretInstruction', () => {
    it('should interpret user instruction and return editing parameters', async () => {
      const instruction = '画像を明るくしてください'
      const modelId = 'model-1'

      const mockModel = {
        id: modelId,
        provider: 'google',
        model_name: 'gemini-2.0-flash-exp',
        display_name: 'Google Gemini 2.0 Flash',
        description: 'Fast model',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockPrisma.aiModel.findUnique.mockResolvedValue(mockModel)

      mockGenerateText.mockResolvedValue({
        text: JSON.stringify({
          action: 'adjust_brightness',
          parameters: { brightness: 20 },
        }),
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      })

      const result = await aiService.interpretInstruction(instruction, modelId)

      expect(mockPrisma.aiModel.findUnique).toHaveBeenCalledWith({
        where: { id: modelId },
      })
      expect(result).toEqual({
        action: 'adjust_brightness',
        parameters: { brightness: 20 },
      })
    })

    it('should throw error when model not found', async () => {
      mockPrisma.aiModel.findUnique.mockResolvedValue(null)

      await expect(
        aiService.interpretInstruction('test', 'invalid-model-id')
      ).rejects.toThrow('AI model not found')
    })
  })
})
