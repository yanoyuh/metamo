import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from './AuthService'
import { PrismaClient } from '@prisma/client'

// Supabaseのモック
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
}

// Prismaのモック
const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  plan: {
    findFirst: vi.fn(),
  },
  userPlan: {
    create: vi.fn(),
  },
} as unknown as PrismaClient

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService(mockSupabase as any, mockPrisma)
  })

  describe('signUp', () => {
    it('should create user in Supabase Auth and database', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const name = 'Test User'

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'auth-uuid-123', email } },
        error: null,
      })

      mockPrisma.plan.findFirst.mockResolvedValue({
        id: 'plan-uuid-1',
        name: '無料プラン',
      })

      mockPrisma.user.create.mockResolvedValue({
        id: 'user-uuid-123',
        email,
        name,
        auth_id: 'auth-uuid-123',
      })

      mockPrisma.userPlan.create.mockResolvedValue({
        id: 'user-plan-uuid-1',
        user_id: 'user-uuid-123',
        plan_id: 'plan-uuid-1',
      })

      const result = await authService.signUp(email, password, name)

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
      })
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          name,
          auth_id: 'auth-uuid-123',
        },
      })
      expect(mockPrisma.userPlan.create).toHaveBeenCalled()
      expect(result).toEqual({
        id: 'user-uuid-123',
        email,
        name,
        auth_id: 'auth-uuid-123',
      })
    })

    it('should throw error when Supabase signup fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' },
      })

      await expect(
        authService.signUp('test@example.com', 'password123')
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('signIn', () => {
    it('should sign in user and return user data', async () => {
      const email = 'test@example.com'
      const password = 'password123'

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'auth-uuid-123', email } },
        error: null,
      })

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-123',
        email,
        name: 'Test User',
        auth_id: 'auth-uuid-123',
      })

      const result = await authService.signIn(email, password)

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { auth_id: 'auth-uuid-123' },
      })
      expect(result).toEqual({
        id: 'user-uuid-123',
        email,
        name: 'Test User',
        auth_id: 'auth-uuid-123',
      })
    })

    it('should throw error when credentials are invalid', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      await expect(
        authService.signIn('test@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      await authService.signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should throw error when sign out fails', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      })

      await expect(authService.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'auth-uuid-123', email: 'test@example.com' } },
        error: null,
      })

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
        auth_id: 'auth-uuid-123',
      })

      const result = await authService.getCurrentUser()

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(result).toEqual({
        id: 'user-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
        auth_id: 'auth-uuid-123',
      })
    })

    it('should return null when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user name', async () => {
      const userId = 'user-uuid-123'
      const newName = 'Updated Name'

      mockPrisma.user.update.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        name: newName,
        auth_id: 'auth-uuid-123',
      })

      const result = await authService.updateUser(userId, { name: newName })

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { name: newName },
      })
      expect(result.name).toBe(newName)
    })
  })
})
