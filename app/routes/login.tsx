import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    try {
      await signIn(formData.email, formData.password)
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] bg-base-100 flex items-center justify-center py-12">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">ログイン</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">メールアドレス</span>
              </label>
              <input
                type="email"
                placeholder="example@mail.com"
                className="input input-bordered"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">パスワード</span>
              </label>
              <input
                type="password"
                placeholder="パスワード"
                className="input input-bordered"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          <div className="divider">または</div>

          <button
            className="btn btn-outline"
            onClick={() => navigate({ to: '/register' })}
          >
            新規登録はこちら
          </button>
        </div>
      </div>
    </div>
  )
}
