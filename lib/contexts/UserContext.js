'use client'
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const mountedRef = useRef(false)
  const activeRequestRef = useRef(0)

  const fetchUser = useCallback(async () => {
    const requestId = activeRequestRef.current + 1
    activeRequestRef.current = requestId
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    if (mountedRef.current) {
      setLoading(true)
    }

    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies with request
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      const data = await res.json()

      if (!mountedRef.current || activeRequestRef.current !== requestId) {
        return
      }

      if (res.ok && data.success && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      if (!mountedRef.current || activeRequestRef.current !== requestId) {
        return
      }

      if (err.name !== 'AbortError') {
        console.error('Failed to fetch current user:', err)
      }

      setUser(null)
    } finally {
      clearTimeout(timeoutId)

      if (mountedRef.current && activeRequestRef.current === requestId) {
        setLoading(false)
        setInitialized(true)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchUser()

    return () => {
      mountedRef.current = false
      activeRequestRef.current += 1
    }
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
      user, setUser, loading, initialized, logout, refreshUser
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
