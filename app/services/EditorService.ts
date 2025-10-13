import { PrismaClient, UserProjectOperation } from '@prisma/client'
import { StorageService } from './StorageService'
import { AIService } from './AIService'
import { UsageService } from './UsageService'
import { PlanService } from './PlanService'

export class EditorService {
  private readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private planService: PlanService

  constructor(
    private prisma: PrismaClient,
    private storageService: StorageService,
    private aiService: AIService,
    private usageService: UsageService
  ) {
    this.planService = new PlanService(prisma)
  }

  async uploadAsset(
    projectId: string,
    fileName: string,
    fileData: Buffer,
    mimeType: string
  ): Promise<string> {
    // ファイル形式の検証
    if (!this.SUPPORTED_FORMATS.includes(mimeType)) {
      throw new Error(
        `Unsupported file format: ${mimeType}. Supported formats: JPEG, PNG, WebP`
      )
    }

    // ファイルサイズの検証
    if (fileData.length > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds 10MB limit. Current size: ${(fileData.length / 1024 / 1024).toFixed(2)}MB`
      )
    }

    // プロジェクト情報を取得してストレージパスを構築
    const project = await this.prisma.userProject.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Check storage limit before upload
    const fileSizeInMB = fileData.length / 1024 / 1024
    const canUpload = await this.planService.checkStorageLimit(project.user_id, fileSizeInMB)
    if (!canUpload) {
      throw new Error('ストレージ容量の上限に達しました。プランをアップグレードしてください。')
    }

    // assets ディレクトリに保存
    const savedPath = await this.storageService.saveAsset(
      project.storage_path,
      fileName,
      fileData
    )

    return savedPath
  }

  async applyEditing(
    userId: string,
    projectId: string,
    instruction: string,
    aiModelId: string
  ): Promise<UserProjectOperation> {
    // Check AI call limit before processing
    const canMakeAiCall = await this.planService.checkAiCallLimit(userId)
    if (!canMakeAiCall) {
      throw new Error('AI呼び出し回数の上限に達しました。プランをアップグレードしてください。')
    }

    // AI に指示を解釈させる
    const editingParams = await this.aiService.interpretInstruction(
      instruction,
      aiModelId
    )

    // プロジェクト情報を取得
    const project = await this.prisma.userProject.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // 現在の画像を履歴に保存
    try {
      const currentImage = await this.storageService.loadCurrent(
        project.storage_path,
        'current.png'
      )

      // 操作数をカウントして sequence_number を決定
      const operationCount = await this.prisma.userProjectOperation.count({
        where: { user_project_id: projectId },
      })

      await this.storageService.saveHistory(
        project.storage_path,
        operationCount + 1,
        'png',
        currentImage
      )
    } catch (error) {
      // 初回の場合は current.png が存在しないので無視
    }

    // 編集を適用（ここでは簡易的に現在の画像をそのまま保存）
    // 実際の画像処理は別途実装が必要
    const currentImagePath = 'current/current.png'

    // 編集済み画像を current に保存（実際の画像処理は省略）
    try {
      const currentImage = await this.storageService.loadCurrent(
        project.storage_path,
        'current.png'
      )
      await this.storageService.saveCurrent(
        project.storage_path,
        'current.png',
        currentImage
      )
    } catch (error) {
      // 初回の場合は current.png が存在しないので無視
    }

    // 操作履歴を記録
    const operation = await this.prisma.userProjectOperation.create({
      data: {
        user_id: userId,
        user_project_id: projectId,
        operation_type: 'ai_edit',
        prompt: instruction,
        result_path: currentImagePath,
        ai_model_id: aiModelId,
      },
    })

    // 使用量を記録
    await this.usageService.recordUsage(userId, 'ai_call', 1, aiModelId)

    return operation
  }

  async getOperations(projectId: string): Promise<UserProjectOperation[]> {
    const operations = await this.prisma.userProjectOperation.findMany({
      where: { user_project_id: projectId },
      orderBy: { created_at: 'asc' },
    })

    return operations
  }

  async undoOperation(projectId: string): Promise<void> {
    // 最新の操作を取得
    const latestOperation = await this.prisma.userProjectOperation.findFirst({
      where: { user_project_id: projectId },
      orderBy: { created_at: 'desc' },
    })

    if (!latestOperation) {
      throw new Error('No operations to undo')
    }

    // プロジェクト情報を取得
    const project = await this.prisma.userProject.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // 履歴から前の状態を復元
    const operationCount = await this.prisma.userProjectOperation.count({
      where: { user_project_id: projectId },
    })

    if (operationCount > 0) {
      const previousImage = await this.storageService.loadHistory(
        project.storage_path,
        operationCount,
        'png'
      )

      await this.storageService.saveCurrent(
        project.storage_path,
        'current.png',
        previousImage
      )
    }
  }

  async exportImage(
    projectId: string,
    format: 'jpeg' | 'png' | 'webp'
  ): Promise<Buffer> {
    const supportedFormats = ['jpeg', 'png', 'webp']
    if (!supportedFormats.includes(format)) {
      throw new Error(
        `Unsupported export format: ${format}. Supported: ${supportedFormats.join(', ')}`
      )
    }

    // プロジェクト情報を取得
    const project = await this.prisma.userProject.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // current/ から最新画像を読み込み
    const imageData = await this.storageService.loadCurrent(
      project.storage_path,
      'current.png'
    )

    // 実際の画像形式変換は別途実装が必要
    return imageData
  }
}
