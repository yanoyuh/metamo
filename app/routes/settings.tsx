import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/utils/supabase'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PlanService } from '@/services/PlanService'
import { prisma } from '@/utils/prisma'
import type { Plan } from '@prisma/client'

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/settings',
        },
      })
    }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'plan'>('profile')
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Plan data
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [currentPlanData, setCurrentPlanData] = useState<any>(null)
  const [usageStats, setUsageStats] = useState({
    storageUsed: 0,
    aiCallsUsed: 0,
    maxStorage: 0,
    maxAiCalls: 0,
  })

  useEffect(() => {
    loadPlanData()
  }, [user])

  const loadPlanData = async () => {
    if (!user) return

    try {
      const planService = new PlanService(prisma)

      // Load available plans
      const plans = await planService.getAllPlans()
      setAvailablePlans(plans)

      // Load current plan
      const userPlan = await planService.getUserPlan(user.id)
      setCurrentPlanData(userPlan)

      // Load usage stats
      const stats = await planService.getUsageStats(user.id)
      setUsageStats(stats)
    } catch (error) {
      console.error('Failed to load plan data:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (user) {
        await updateUser(user.id, { name })
        setMessage('プロフィールを更新しました')
      }
    } catch (error: any) {
      setMessage(error.message || '更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePlan = async (planId: string) => {
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const planService = new PlanService(prisma)
      await planService.changePlan(user.id, planId)
      setMessage('プランを変更しました')
      await loadPlanData()
    } catch (error: any) {
      setMessage(error.message || 'プラン変更に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] bg-base-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">設定</h1>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <a
            className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            プロフィール
          </a>
          <a
            className={`tab ${activeTab === 'plan' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            プラン情報
          </a>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">プロフィール設定</h2>

              {message && (
                <div className="alert alert-info mb-4">
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">名前</span>
                  </label>
                  <input
                    type="text"
                    placeholder="名前を入力"
                    className="input input-bordered"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">メールアドレス</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={user?.email || ''}
                    disabled
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      メールアドレスは変更できません
                    </span>
                  </label>
                </div>

                <div className="divider">パスワード変更</div>

                <div className="alert alert-warning">
                  <span>
                    パスワード変更機能は開発中です。Supabase
                    のパスワードリセット機能をご利用ください。
                  </span>
                </div>

                <div className="card-actions justify-end mt-6">
                  <button
                    type="submit"
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            {message && (
              <div className="alert alert-info">
                <span>{message}</span>
              </div>
            )}

            {/* Current Plan */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">現在のプラン</h2>

                {currentPlanData ? (
                  <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                      <div className="stat-title">プラン</div>
                      <div className="stat-value text-2xl">
                        {currentPlanData.plan.name}
                      </div>
                      <div className="stat-desc">
                        月額 ¥{Number(currentPlanData.plan.price).toLocaleString()}
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">ストレージ使用量</div>
                      <div className="stat-value text-2xl">
                        {usageStats.storageUsed} MB
                      </div>
                      <div className="stat-desc">
                        / {usageStats.maxStorage} MB
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">AI呼び出し回数</div>
                      <div className="stat-value text-2xl">
                        {usageStats.aiCallsUsed} 回
                      </div>
                      <div className="stat-desc">
                        / {usageStats.maxAiCalls} 回/月
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* Available Plans */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">プラン変更</h2>

                {availablePlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availablePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`card bg-base-100 shadow ${
                          currentPlanData && plan.id === currentPlanData.plan.id
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                      >
                        <div className="card-body">
                          <h3 className="card-title">{plan.name}</h3>
                          <div className="text-3xl font-bold my-2">
                            ¥{Number(plan.price).toLocaleString()}
                            <span className="text-sm font-normal">/月</span>
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li>✓ {plan.max_storage} MB ストレージ</li>
                            <li>✓ {plan.max_ai_calls} 回/月 AI呼び出し</li>
                          </ul>
                          <div className="card-actions justify-end mt-4">
                            {currentPlanData && plan.id === currentPlanData.plan.id ? (
                              <span className="badge badge-primary">現在のプラン</span>
                            ) : (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleChangePlan(plan.id)}
                                disabled={loading}
                              >
                                {loading ? '処理中...' : '変更'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
