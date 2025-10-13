// 環境変数の読み込みと検証

export interface EnvConfig {
  // Supabase
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey?: string

  // Database
  databaseUrl?: string
  directUrl?: string

  // AI API Keys
  googleApiKey?: string
  openaiApiKey?: string
  anthropicApiKey?: string

  // Storage
  storageRoot: string

  // App
  appUrl: string
  nodeEnv: string
}

export function loadEnv(): EnvConfig {
  // Client-side environment variables (prefixed with VITE_)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000'
  const nodeEnv = import.meta.env.MODE || 'development'

  // Server-side environment variables (accessed via process.env in Node.js context)
  const storageRoot = import.meta.env.STORAGE_ROOT || 'storages/storage1'

  // Validate required environment variables
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is required')
  }

  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is required')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl: import.meta.env.DATABASE_URL,
    directUrl: import.meta.env.DIRECT_URL,
    googleApiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY,
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    storageRoot,
    appUrl,
    nodeEnv,
  }
}

// Export singleton instance
export const env = loadEnv()
