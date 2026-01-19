import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

interface AuthContextType {
  user: { user_id: string; email: string; name?: string; createdAt?: string } | null
  session: null
  loading: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ user_id: string; email: string; name?: string; createdAt?: string } | null>(null)
  const [session] = useState<null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    const userJson = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    if (token && userJson) {
      try {
        const u = JSON.parse(userJson)
        setUser(u)
      } catch {}
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string, remember: boolean = false) => {
    const res = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password
    })
    const token = res.data.token as string
    const u = res.data.user as { user_id: string; email: string; name?: string; createdAt?: string }
    if (remember) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(u))
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
    } else {
      sessionStorage.setItem('auth_token', token)
      sessionStorage.setItem('auth_user', JSON.stringify(u))
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    setUser(u)
  }

  const signUp = async (email: string, password: string, name: string) => {
    const res = await api.post('/auth/register', {
      email: email.trim().toLowerCase(),
      password,
      name
    })
    const token = res.data.token as string
    const u = res.data.user as { user_id: string; email: string; name?: string; createdAt?: string }
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(u))
    setUser(u)
  }

  const signOut = async () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    setUser(null)
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
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
