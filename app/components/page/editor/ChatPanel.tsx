import { useState } from 'react'
import { useEditor } from '@/contexts/EditorContext'
import { Route } from '@/routes/editor.$userProjectId'
import { EditorService } from '@/services/EditorService'
import { StorageService } from '@/services/StorageService'
import { AIService } from '@/services/AIService'
import { UsageService } from '@/services/UsageService'
import { prisma } from '@/utils/prisma'
import { env } from '@/utils/env'

export function ChatPanel() {
  const { state, addChatMessage, setCurrentImage } = useEditor()
  const { userProjectId } = Route.useParams()
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    addChatMessage({ role: 'user', content: input })
    const userInstruction = input
    setInput('')
    setIsProcessing(true)
    setProgress(0)

    try {
      // Initialize services
      const storageService = new StorageService()
      const aiService = new AIService(prisma, env)
      const usageService = new UsageService(prisma)
      const editorService = new EditorService(
        prisma,
        storageService,
        aiService,
        usageService
      )

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      addChatMessage({
        role: 'ai',
        content: 'はい、承知いたしました。画像を編集しています...',
      })

      // Get available AI models
      const models = await aiService.getAvailableModels()
      const defaultModel = models.find((m) => m.provider === 'google') || models[0]

      // Apply editing instruction
      const result = await editorService.applyEditing(
        userProjectId,
        userInstruction,
        defaultModel.id,
        state.selectedRegion || undefined,
        state.clickPosition || undefined
      )

      clearInterval(progressInterval)
      setProgress(100)

      addChatMessage({
        role: 'ai',
        content: `編集が完了しました。\n操作ID: ${result.operationId}\n編集内容: ${result.params.editType}`,
      })

      // Load the edited image
      if (result.outputPath) {
        // In a real implementation, we would load the image from the output path
        // For now, we'll keep the current image as placeholder
        addChatMessage({
          role: 'ai',
          content: '編集結果が保存されました。',
        })
      }

      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Failed to process editing:', error)
      addChatMessage({
        role: 'ai',
        content: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
      })
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex flex-col h-full bg-base-200">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">チャットエリア</h2>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.chatHistory.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>画像編集の指示を入力してください</p>
          </div>
        )}

        {state.chatHistory.map((message) => (
          <div
            key={message.id}
            className={`chat ${
              message.role === 'user' ? 'chat-end' : 'chat-start'
            }`}
          >
            <div className="chat-bubble">
              {message.content}
            </div>
          </div>
        ))}

        {/* Progress Indicator */}
        {isProcessing && (
          <div className="flex flex-col gap-2">
            <div className="text-center text-sm text-gray-500">
              処理中... {progress}%
            </div>
            <progress
              className="progress progress-primary w-full"
              value={progress}
              max="100"
            />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <label className="label">
          <span className="label-text">チャット入力</span>
        </label>
        <div className="flex gap-2">
          <textarea
            className="textarea textarea-bordered flex-1"
            placeholder="画像UP、白紙スケッチ、書込指示、範囲選択"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={3}
            disabled={isProcessing}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              '送信'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
