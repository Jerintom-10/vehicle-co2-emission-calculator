import React, { createContext, useState, useCallback, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth on mount - restore from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } else {
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to restore auth from localStorage:', err)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password, fullName) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : Array.isArray(data.detail) 
          ? data.detail.map(e => e.msg).join(', ')
          : 'Registration failed'
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setToken(data.access_token)
      setUser(data.user)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : Array.isArray(data.detail) 
          ? data.detail.map(e => e.msg).join(', ')
          : 'Login failed'
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setToken(data.access_token)
      setUser(data.user)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
