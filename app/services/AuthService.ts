import { SupabaseClient } from '@supabase/supabase-js'
import { PrismaClient, User } from '@prisma/client'

export class AuthService {
  constructor(
    private supabase: SupabaseClient,
    private prisma: PrismaClient
  ) {}

  async signUp(email: string, password: string, name?: string): Promise<User> {
    // Supabase Authでユーザー作成
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    })

    if (error || !data.user) {
      throw new Error(error?.message || 'Sign up failed')
    }

    // デフォルトプラン（無料プラン）を取得
    const defaultPlan = await this.prisma.plan.findFirst({
      where: { name: '無料プラン' },
    })

    if (!defaultPlan) {
      throw new Error('Default plan not found')
    }

    // usersテーブルにユーザー登録
    const user = await this.prisma.user.create({
      data: {
        email: data.user.email!,
        name: name || null,
        auth_id: data.user.id,
      },
    })

    // user_plansにデフォルトプラン関連付け
    await this.prisma.userPlan.create({
      data: {
        user_id: user.id,
        plan_id: defaultPlan.id,
      },
    })

    return user
  }

  async signIn(email: string, password: string): Promise<User> {
    // Supabase Authでログイン
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw new Error(error?.message || 'Sign in failed')
    }

    // usersテーブルからユーザー情報取得
    const user = await this.prisma.user.findUnique({
      where: { auth_id: data.user.id },
    })

    if (!user) {
      throw new Error('User not found in database')
    }

    return user
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser()

    if (error || !data.user) {
      return null
    }

    const user = await this.prisma.user.findUnique({
      where: { auth_id: data.user.id },
    })

    return user
  }

  async updateUser(
    userId: string,
    data: { name?: string }
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    })

    return user
  }
}
