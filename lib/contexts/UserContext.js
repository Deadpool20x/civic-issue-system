'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching user from /api/auth/me...')
      const res = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies with request
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await res.json()
      console.log('📦 Received user data:', data)
      if (data.success && data.user) {
        console.log('✅ User authenticated:', data.user.email, data.user.role)
        setUser(data.user)
      } else {
        console.log('❌ No user in response')
        setUser(null)
      }
    } catch (err) {
      console.error('💥 Error fetching user:', err)
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    }
    setUser(null)
    // Guard window access for SSR safety
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  async function refreshUser() {
    await fetchUser()
  }

  return (
    <UserContext.Provider value={{
      user, setUser, loading, logout, refreshUser
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}