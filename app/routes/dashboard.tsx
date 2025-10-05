import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/utils/supabase'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/dashboard',
        },
      })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>
        <p className="text-gray-500">
          プロジェクト一覧（実装予定）
        </p>
      </div>
    </div>
  )
}
