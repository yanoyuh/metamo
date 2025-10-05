import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-center mb-6">Metamo</h1>
        <p className="text-xl text-center mb-12">AI画像編集Webアプリケーション</p>

        <div className="flex justify-center gap-4">
          <Link to="/register" className="btn btn-primary">
            新規登録
          </Link>
          <Link to="/login" className="btn btn-outline">
            ログイン
          </Link>
        </div>
      </div>
    </div>
  )
}
