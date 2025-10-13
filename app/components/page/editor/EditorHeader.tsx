import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'

interface EditorHeaderProps {
  projectTitle: string
  onExport: () => void
}

export function EditorHeader({ projectTitle, onExport }: EditorHeaderProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <header className="navbar bg-base-200 shadow-sm border-b">
      <div className="navbar-start">
        <Link to="/dashboard" className="btn btn-ghost">
          プロジェクト一覧
        </Link>
      </div>

      <div className="navbar-center">
        <h1 className="text-xl font-bold">{projectTitle}</h1>
      </div>

      <div className="navbar-end gap-2">
        <button className="btn btn-ghost btn-sm">設定ツール</button>
        <button className="btn btn-primary btn-sm" onClick={onExport}>
          画像DL
        </button>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm">
            アカウント関連
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/settings">設定</Link>
            </li>
            <li>
              <Link to="/dashboard">ダッシュボード</Link>
            </li>
            <li>
              <button onClick={handleLogout}>ログアウト</button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
