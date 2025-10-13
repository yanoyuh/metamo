import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadEnv } from './env'

describe('loadEnv', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    // Reset import.meta.env
    Object.keys(import.meta.env).forEach(key => {
      delete (import.meta.env as any)[key]
    })
  })

  afterEach(() => {
    // Restore original env
    Object.assign(import.meta.env, originalEnv)
  })

  it('should load required environment variables', () => {
    ;(import.meta.env as any).VITE_SUPABASE_URL = 'http://localhost:54321'
    ;(import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'test-anon-key'

    const env = loadEnv()

    expect(env.supabaseUrl).toBe('http://localhost:54321')
    expect(env.supabaseAnonKey).toBe('test-anon-key')
  })

  it('should throw error when VITE_SUPABASE_URL is missing', () => {
    ;(import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'test-anon-key'

    expect(() => loadEnv()).toThrow('VITE_SUPABASE_URL is required')
  })

  it('should throw error when VITE_SUPABASE_ANON_KEY is missing', () => {
    ;(import.meta.env as any).VITE_SUPABASE_URL = 'http://localhost:54321'

    expect(() => loadEnv()).toThrow('VITE_SUPABASE_ANON_KEY is required')
  })

  it('should use default values for optional variables', () => {
    ;(import.meta.env as any).VITE_SUPABASE_URL = 'http://localhost:54321'
    ;(import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'test-anon-key'

    const env = loadEnv()

    expect(env.appUrl).toBe('http://localhost:3000')
    expect(env.storageRoot).toBe('storages/storage1')
    expect(env.nodeEnv).toBe('development')
  })

  it('should load optional API keys when provided', () => {
    ;(import.meta.env as any).VITE_SUPABASE_URL = 'http://localhost:54321'
    ;(import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'test-anon-key'
    ;(import.meta.env as any).VITE_GOOGLE_AI_API_KEY = 'google-key'
    ;(import.meta.env as any).VITE_OPENAI_API_KEY = 'openai-key'
    ;(import.meta.env as any).VITE_ANTHROPIC_API_KEY = 'anthropic-key'

    const env = loadEnv()

    expect(env.googleApiKey).toBe('google-key')
    expect(env.openaiApiKey).toBe('openai-key')
    expect(env.anthropicApiKey).toBe('anthropic-key')
  })
})
