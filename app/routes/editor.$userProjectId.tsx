import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/utils/supabase'
import { EditorProvider } from '@/contexts/EditorContext'
import { EditorHeader } from '@/components/page/editor/EditorHeader'
import { ChatPanel } from '@/components/page/editor/ChatPanel'
import { ToolPanel } from '@/components/page/editor/ToolPanel'
import { ImageDisplayPanel } from '@/components/page/editor/ImageDisplayPanel'

export const Route = createFileRoute('/editor/$userProjectId')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/editor/$userProjectId',
        },
      })
    }
  },
  component: EditorPage,
})

function EditorPage() {
  const { userProjectId } = Route.useParams()

  const handleExport = async () => {
    try {
      const storageService = new (await import('@/services/StorageService')).StorageService()
      const aiService = new (await import('@/services/AIService')).AIService(
        (await import('@/utils/prisma')).prisma,
        (await import('@/utils/env')).env
      )
      const usageService = new (await import('@/services/UsageService')).UsageService(
        (await import('@/utils/prisma')).prisma
      )
      const editorService = new (await import('@/services/EditorService')).EditorService(
        (await import('@/utils/prisma')).prisma,
        storageService,
        aiService,
        usageService
      )

      const imageData = await editorService.exportImage(userProjectId, 'png')

      // Create download link
      const blob = new Blob([imageData], { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-${userProjectId}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export image:', error)
      alert(`エクスポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  return (
    <EditorProvider>
      <div className="flex flex-col h-screen">
        <EditorHeader
          projectTitle={`プロジェクト ${userProjectId}`}
          onExport={handleExport}
        />

        {/* Responsive 3-column layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left: Chat Panel - Full width on mobile, 1/3 on desktop */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r overflow-y-auto">
            <ChatPanel />
          </div>

          {/* Center: Tool Panel - Full width on mobile, 1/4 on desktop */}
          <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r overflow-y-auto">
            <ToolPanel />
          </div>

          {/* Right: Image Display Panel - Full width on mobile, flex-1 on desktop */}
          <div className="flex-1 overflow-y-auto">
            <ImageDisplayPanel />
          </div>
        </div>
      </div>
    </EditorProvider>
  )
}
