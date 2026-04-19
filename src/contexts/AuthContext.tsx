/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import api from '@/services/api'

interface User {
  id: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE'
}

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<User['role']>
  signOut: () => void
}

function decodeJwt(token: string): { sub: string; email: string; role: User['role']; exp: number } {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

function getStoredUser(): User | null {
  const token = localStorage.getItem('@pizzaria:token')
  if (!token) return null
  try {
    const payload = decodeJwt(token)
    if (payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem('@pizzaria:token')
      localStorage.removeItem('@pizzaria:refreshToken')
      return null
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return { id: payload.sub, email: payload.email, role: payload.role }
  } catch {
    localStorage.clear()
    return null
  }
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer: lê localStorage uma vez na montagem, sem useEffect
  const [user, setUser] = useState<User | null>(getStoredUser)

  const signIn = useCallback(async (email: string, password: string): Promise<User['role']> => {
    const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, password },
    )
    const payload = decodeJwt(data.accessToken)

    localStorage.setItem('@pizzaria:token', data.accessToken)
    localStorage.setItem('@pizzaria:refreshToken', data.refreshToken)
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
    setUser({ id: payload.sub, email: payload.email, role: payload.role })

    return payload.role
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('@pizzaria:token')
    localStorage.removeItem('@pizzaria:refreshToken')
    delete api.defaults.headers.common.Authorization
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
