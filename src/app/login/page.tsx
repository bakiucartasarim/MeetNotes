'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    sifre: ''
  })
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (data.success) {
        // Use AuthContext to handle login
        login(data.token, data.user)
        
        // Redirect to meetings page
        router.push('/meetings')
      } else {
        setError(data.error || 'Giriş yapılırken hata oluştu')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giriş Yap</h1>
          <p className="text-gray-600">Toplantı yönetim sisteminize hoş geldiniz</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={form.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ornek@sirket.com"
              />
            </div>

            <div>
              <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                id="sifre"
                name="sifre"
                required
                value={form.sifre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Şifrenizi girin"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.email.trim() || !form.sifre.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Henüz hesabınız yok mu?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Kayıt Ol
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Hesaplar</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p><strong>Proje Yöneticisi:</strong> ahmet@workcube.com | 123456</p>
            <p><strong>Developer:</strong> fatma@workcube.com | 123456</p>
            <p><strong>QA Engineer:</strong> ayse@workcube.com | 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}