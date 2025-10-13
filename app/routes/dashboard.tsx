import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { supabase } from '@/utils/supabase'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user } = useAuth()
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [projects] = useState([
    // ダミーデータ
    { id: '1', name: 'プロジェクト1', thumbnail: null },
    { id: '2', name: 'プロジェクト2', thumbnail: null },
  ])

  const handleCreateProject = () => {
    // TODO: ProjectService を使用してプロジェクトを作成
    console.log('Creating project:', newProjectName)
    setShowNewProjectModal(false)
    setNewProjectName('')
  }

  return (
    <div className="flex min-h-[calc(100vh-16rem)]">
      {/* Side Menu */}
      <aside className="w-64 bg-base-200 p-4">
        <nav className="menu">
          <li>
            <button
              className="btn btn-primary w-full mb-2"
              onClick={() => setShowNewProjectModal(true)}
            >
              New Project
            </button>
          </li>
          <li className="menu-title">
            <span>Projects</span>
          </li>
          <li>
            <a className="active">すべてのプロジェクト</a>
          </li>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">マイプロジェクト</h1>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/editor/${project.id}`}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <figure className="bg-base-300 h-48 flex items-center justify-center">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.name} />
                ) : (
                  <span className="text-gray-500">最新の画像</span>
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title">{project.name}</h2>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.preventDefault()
                      // TODO: 削除確認モーダル
                      console.log('Delete project:', project.id)
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              プロジェクトがありません
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowNewProjectModal(true)}
            >
              最初のプロジェクトを作成
            </button>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">新しいプロジェクト</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">プロジェクト名</span>
              </label>
              <input
                type="text"
                placeholder="プロジェクト名を入力"
                className="input input-bordered"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowNewProjectModal(false)
                  setNewProjectName('')
                }}
              >
                キャンセル
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
              >
                作成
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowNewProjectModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
