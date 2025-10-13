import { PrismaClient, AiModel } from '@prisma/client'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { loadEnv } from '@/utils/env'

export interface EditingParameters {
  action: string
  parameters: Record<string, any>
}

export class AIService {
  private env: ReturnType<typeof loadEnv>

  constructor(private prisma: PrismaClient) {
    this.env = loadEnv()
  }

  async getAvailableModels(): Promise<AiModel[]> {
    const models = await this.prisma.aiModel.findMany({
      where: { is_active: true },
    })

    return models
  }

  async interpretInstruction(
    instruction: string,
    modelId: string
  ): Promise<EditingParameters> {
    // モデル情報を取得
    const aiModel = await this.prisma.aiModel.findUnique({
      where: { id: modelId },
    })

    if (!aiModel) {
      throw new Error('AI model not found')
    }

    // プロバイダに応じてモデルを選択
    let model
    switch (aiModel.provider) {
      case 'google':
        if (!this.env.googleApiKey) {
          throw new Error('Google AI API key is not configured')
        }
        model = google(aiModel.model_name, {
          apiKey: this.env.googleApiKey,
        })
        break
      case 'openai':
        if (!this.env.openaiApiKey) {
          throw new Error('OpenAI API key is not configured')
        }
        model = openai(aiModel.model_name, {
          apiKey: this.env.openaiApiKey,
        })
        break
      case 'anthropic':
        if (!this.env.anthropicApiKey) {
          throw new Error('Anthropic API key is not configured')
        }
        model = anthropic(aiModel.model_name, {
          apiKey: this.env.anthropicApiKey,
        })
        break
      default:
        throw new Error(`Unsupported AI provider: ${aiModel.provider}`)
    }

    // AI にプロンプトを送信
    const prompt = `
あなたは画像編集AIアシスタントです。ユーザーの指示を解釈し、適用すべき編集アクションとパラメータをJSON形式で返してください。

ユーザーの指示: ${instruction}

以下のJSON形式で返してください：
{
  "action": "編集アクション名（例: adjust_brightness, adjust_contrast, crop, resize, filter）",
  "parameters": {
    "パラメータ名": "値"
  }
}

JSONのみを返してください。説明は不要です。
`

    const result = await generateText({
      model,
      prompt,
    })

    // JSON をパース
    try {
      const editingParams = JSON.parse(result.text)
      return editingParams
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${result.text}`)
    }
  }
}
