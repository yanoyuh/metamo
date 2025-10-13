import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [chatInput, setChatInput] = useState('')

  return (
    <div className="bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-base-200">
        <div className="hero-content text-center flex-col gap-8 w-full max-w-3xl px-4">
          <h1 className="text-3xl md:text-5xl font-bold">どんな画像を作りたいですか？</h1>

          {/* Chat Input */}
          <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body p-4 md:p-8">
              <label className="label">
                <span className="label-text">チャット入力</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="キャラクター画像追加、シチュエーション画像"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              ></textarea>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm md:btn-md">送信</button>
              </div>
            </div>
          </div>

          {/* From Template Button */}
          <button
            className="btn btn-outline btn-wide btn-sm md:btn-md"
            onClick={() => setShowTemplateModal(true)}
          >
            From Template
          </button>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">テンプレートを選択</h3>
            <p className="py-4">
              テンプレート機能は開発中です。プロンプトベースで画像を作成してください。
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowTemplateModal(false)}
              >
                閉じる
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowTemplateModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
