import { useState, useEffect } from 'react'
import { Route } from '@/routes/editor.$userProjectId'

export function ToolPanel() {
  const { userProjectId } = Route.useParams()
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [operations, setOperations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadOperations = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement API endpoint for loading operations
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      setOperations([
        {
          id: '1',
          user_instruction: '画像を明るくする',
          ai_model_id: 'gemini-1.5',
          status: 'completed',
          created_at: new Date(),
        },
      ])
    } catch (error) {
      console.error('Failed to load operations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (showHistoryModal) {
      loadOperations()
    }
  }, [showHistoryModal])

  const handleUndo = async () => {
    if (operations.length === 0) return

    try {
      // TODO: Implement API endpoint for undo
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reload operations after undo
      await loadOperations()

      alert('アンドゥが完了しました（デモモード）')
    } catch (error) {
      console.error('Failed to undo operation:', error)
      alert(`アンドゥに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  return (
    <div className="flex flex-col h-full bg-base-200">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">ツールエリア</h2>
        <p className="text-sm text-gray-500">検討中・画像の加工用のツールなど</p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        <button className="btn btn-outline w-full">クロップ</button>
        <button className="btn btn-outline w-full">フィルタ</button>
        <button className="btn btn-outline w-full">調整</button>

        <div className="divider">履歴</div>

        <button
          className="btn btn-outline w-full"
          onClick={() => setShowHistoryModal(true)}
        >
          履歴
        </button>

        <button
          className="btn btn-outline w-full"
          onClick={handleUndo}
          disabled={operations.length === 0}
        >
          アンドゥ
        </button>
        <button className="btn btn-outline w-full" disabled>
          リドゥ
        </button>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">編集履歴</h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : operations.length === 0 ? (
              <p className="py-4 text-center text-gray-500">編集履歴がありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>日時</th>
                      <th>編集内容</th>
                      <th>AIモデル</th>
                      <th>ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((op) => (
                      <tr key={op.id}>
                        <td>{new Date(op.created_at).toLocaleString('ja-JP')}</td>
                        <td>
                          <div className="max-w-xs truncate">
                            {op.user_instruction}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-sm">
                            {op.ai_model_id}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            op.status === 'completed' ? 'badge-success' :
                            op.status === 'failed' ? 'badge-error' :
                            'badge-warning'
                          }`}>
                            {op.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowHistoryModal(false)}
              >
                閉じる
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowHistoryModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
