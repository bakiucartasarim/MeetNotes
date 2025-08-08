'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  // Redirect logic
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        // Logged in users go to meetings dashboard
        window.location.href = '/meetings'
      } else {
        // Not logged in users go to welcome page
        window.location.href = '/welcome'
      }
    }
  }, [isAuthenticated, authLoading])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // This will only show briefly before redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
      </div>
    </div>
  )
}