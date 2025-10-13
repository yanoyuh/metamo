import { Link } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="navbar bg-base-200 shadow-sm">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">
          ロゴ
        </Link>
        {user && (
          <Link to="/dashboard" className="btn btn-ghost">
            プロジェクト一覧
          </Link>
        )}
      </div>

      <div className="navbar-center">
        <span className="text-sm">ヘッダーメニュー</span>
      </div>

      <div className="navbar-end gap-2">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm">
            SNSメニュー
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a>Twitter</a>
            </li>
            <li>
              <a>Facebook</a>
            </li>
          </ul>
        </div>

        {user ? (
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
                <button onClick={() => signOut()}>ログアウト</button>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              ログイン
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              新規登録
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
