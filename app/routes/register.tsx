import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!formData.name || !formData.email || !formData.password) {
      setError('すべてのフィールドを入力してください')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)
    try {
      await signUp(formData.email, formData.password, formData.name)
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      setError(err.message || '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] bg-base-100 flex items-center justify-center py-12">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">新規登録</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">名前</span>
              </label>
              <input
                type="text"
                placeholder="山田太郎"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control mt-4">
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
                placeholder="6文字以上"
                className="input input-bordered"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">パスワード（確認）</span>
              </label>
              <input
                type="password"
                placeholder="パスワードを再入力"
                className="input input-bordered"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
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
                {loading ? '登録中...' : '登録'}
              </button>
            </div>
          </form>

          <div className="divider">または</div>

          <button
            className="btn btn-outline"
            onClick={() => navigate({ to: '/login' })}
          >
            ログインはこちら
          </button>
        </div>
      </div>
    </div>
  )
}
