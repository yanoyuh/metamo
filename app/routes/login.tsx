import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">ログイン</h2>
          <p className="text-sm text-gray-500 mb-4">
            ログインページ（実装予定）
          </p>
        </div>
      </div>
    </div>
  )
}
