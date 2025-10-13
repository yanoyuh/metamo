import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { useEditor } from '@/contexts/EditorContext'

export function ImageDisplayPanel() {
  const { state, setCurrentImage, setSelectedRegion, setClickPosition } = useEditor()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [isCanvasMode, setIsCanvasMode] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCurrentImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && isCanvasMode && state.currentImage) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f0f0f0',
      })

      fabricCanvasRef.current = canvas

      // Load image onto canvas
      fabric.Image.fromURL(state.currentImage, (img) => {
        canvas.setWidth(img.width || 800)
        canvas.setHeight(img.height || 600)
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: 1,
          scaleY: 1,
        })
      })

      // Enable zoom with mouse wheel
      canvas.on('mouse:wheel', (opt) => {
        const evt = opt.e as WheelEvent
        const delta = evt.deltaY
        let zoom = canvas.getZoom()
        zoom *= 0.999 ** delta
        if (zoom > 20) zoom = 20
        if (zoom < 0.1) zoom = 0.1
        canvas.zoomToPoint({ x: evt.offsetX, y: evt.offsetY }, zoom)
        evt.preventDefault()
        evt.stopPropagation()
      })

      // Enable pan with mouse drag (when not in selection mode)
      let isPanning = false
      let lastPosX = 0
      let lastPosY = 0

      canvas.on('mouse:down', (opt) => {
        const evt = opt.e as MouseEvent
        if (!selectionMode && evt.altKey) {
          isPanning = true
          canvas.selection = false
          lastPosX = evt.clientX
          lastPosY = evt.clientY
        } else if (!selectionMode) {
          // Record click position
          const pointer = canvas.getPointer(opt.e)
          setClickPosition({ x: pointer.x, y: pointer.y })
        }
      })

      canvas.on('mouse:move', (opt) => {
        if (isPanning) {
          const evt = opt.e as MouseEvent
          const vpt = canvas.viewportTransform
          if (vpt) {
            vpt[4] += evt.clientX - lastPosX
            vpt[5] += evt.clientY - lastPosY
            canvas.requestRenderAll()
            lastPosX = evt.clientX
            lastPosY = evt.clientY
          }
        }
      })

      canvas.on('mouse:up', () => {
        isPanning = false
        canvas.selection = true
      })

      // Handle selection mode
      if (selectionMode) {
        canvas.on('selection:created', (e) => {
          const selection = e.selected?.[0]
          if (selection) {
            setSelectedRegion({
              x: selection.left || 0,
              y: selection.top || 0,
              width: selection.width || 0,
              height: selection.height || 0,
            })
          }
        })

        canvas.on('selection:updated', (e) => {
          const selection = e.selected?.[0]
          if (selection) {
            setSelectedRegion({
              x: selection.left || 0,
              y: selection.top || 0,
              width: selection.width || 0,
              height: selection.height || 0,
            })
          }
        })
      }

      return () => {
        canvas.dispose()
      }
    }
  }, [isCanvasMode, state.currentImage, selectionMode, setSelectedRegion, setClickPosition])

  const handleEnterCanvasMode = () => {
    setIsCanvasMode(true)
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
  }

  return (
    <div className="flex flex-col h-full bg-base-200">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">画像表示エリア</h2>
      </div>

      <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
        {state.currentImage ? (
          isCanvasMode ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 justify-center">
                <button
                  className={`btn btn-sm ${selectionMode ? 'btn-primary' : 'btn-outline'}`}
                  onClick={toggleSelectionMode}
                >
                  領域選択モード
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setIsCanvasMode(false)}
                >
                  プレビューに戻る
                </button>
              </div>
              <div className="border rounded shadow-lg">
                <canvas ref={canvasRef} />
              </div>
              <div className="text-sm text-gray-500 text-center">
                Alt + ドラッグ: パン | マウスホイール: ズーム
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={state.currentImage}
                alt="編集中の画像"
                className="max-w-full max-h-full object-contain border rounded shadow-lg"
              />
              <div className="mt-4 text-center">
                <button className="btn btn-primary" onClick={handleEnterCanvasMode}>
                  編集する
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">画像をアップロードしてください</p>
            <label className="btn btn-primary">
              画像を選択
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        )}
      </div>

      {state.currentImage && (
        <div className="p-4 border-t">
          <div className="alert alert-info">
            <span>
              AIによる画像編集結果の提示
              <br />
              画像のダウンロードオプションを選択できます。
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
