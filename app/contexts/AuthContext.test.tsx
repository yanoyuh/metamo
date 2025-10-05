import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import React from 'react'

// Supabase と Prisma のモック
vi.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

vi.mock('@/utils/prisma', () => ({
  prisma: {
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
  },
}))

function TestComponent() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>No user</div>
  return <div>User: {user.email}</div>
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide auth context to children', async () => {
    const { supabase } = await import('@/utils/supabase')

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeDefined()
    })
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    spy.mockRestore()
  })

  it('should load current user on mount', async () => {
    const { supabase } = await import('@/utils/supabase')
    const { prisma } = await import('@/utils/prisma')

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'auth-123', email: 'test@example.com' } },
      error: null,
    })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      auth_id: 'auth-123',
      created_at: new Date(),
      updated_at: new Date(),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeDefined()
    })
  })
})
