import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should create Supabase client with environment variables', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')

    const { supabase } = await import('./supabase')

    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should throw error when VITE_SUPABASE_URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')

    await expect(async () => {
      await import('./supabase')
    }).rejects.toThrow('VITE_SUPABASE_URL is required')
  })

  it('should throw error when VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(async () => {
      await import('./supabase')
    }).rejects.toThrow('VITE_SUPABASE_ANON_KEY is required')
  })
})
