import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@prisma/client'
import { AuthService } from '@/services/AuthService'
import { supabase } from '@/utils/supabase'
import { prisma } from '@/utils/prisma'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<User>
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  updateUser: (userId: string, data: { name?: string }) => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = new AuthService(supabase, prisma)

  useEffect(() => {
    // 初回ロード時に現在のユーザーを取得
    authService.getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Supabase Auth の状態変更をリスニング
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    const newUser = await authService.signUp(email, password, name)
    setUser(newUser)
    return newUser
  }

  const signIn = async (email: string, password: string) => {
    const loggedInUser = await authService.signIn(email, password)
    setUser(loggedInUser)
    return loggedInUser
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const updateUser = async (userId: string, data: { name?: string }) => {
    const updatedUser = await authService.updateUser(userId, data)
    setUser(updatedUser)
    return updatedUser
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
