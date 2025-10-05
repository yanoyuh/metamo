import { createClient } from '@supabase/supabase-js'
import { loadEnv } from './env'

const env = loadEnv()

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
