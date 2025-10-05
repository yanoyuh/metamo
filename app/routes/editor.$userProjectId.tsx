import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/utils/supabase'

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

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">エディター</h1>
        <p className="text-gray-500">
          プロジェクトID: {userProjectId}（実装予定）
        </p>
      </div>
    </div>
  )
}
