'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<{id: number, ad: string}[]>([])
  const [form, setForm] = useState({
    adSoyad: '',
    email: '',
    sifre: '',
    sifreTekrar: '',
    departman: '',
    pozisyon: '',
    sirketId: '',
    yeniSirket: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCompanies(data.data)
        }
      }
    } catch (error) {
      console.error('Companies fetch error:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (form.sifre !== form.sifreTekrar) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (form.sifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adSoyad: form.adSoyad,
          email: form.email,
          sifre: form.sifre,
          departman: form.departman,
          pozisyon: form.pozisyon,
          sirketId: form.sirketId === 'yeni' ? null : form.sirketId,
          yeniSirket: form.sirketId === 'yeni' ? form.yeniSirket : null
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Use AuthContext to handle login
        login(data.token, data.user)
        
        // Redirect to meetings page
        router.push('/meetings')
      } else {
        setError(data.error || 'Kayıt olurken hata oluştu')
      }
    } catch (error) {
      console.error('Register error:', error)
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
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kayıt Ol</h1>
          <p className="text-gray-600">Toplantı yönetim sistemine katılın</p>
        </div>

        {/* Register Form */}
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
              <label htmlFor="adSoyad" className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                id="adSoyad"
                name="adSoyad"
                required
                value={form.adSoyad}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Örn: Mehmet Yılmaz"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi *
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
              <label htmlFor="sirketId" className="block text-sm font-medium text-gray-700 mb-2">
                Şirket *
              </label>
              <select
                id="sirketId"
                name="sirketId"
                required
                value={form.sirketId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Şirketinizi seçin</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id.toString()}>
                    {company.ad}
                  </option>
                ))}
                <option value="yeni">+ Yeni Şirket Ekle</option>
              </select>
            </div>

            {form.sirketId === 'yeni' && (
              <div>
                <label htmlFor="yeniSirket" className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şirket Adı *
                </label>
                <input
                  type="text"
                  id="yeniSirket"
                  name="yeniSirket"
                  required
                  value={form.yeniSirket}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Şirket adını girin"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="departman" className="block text-sm font-medium text-gray-700 mb-2">
                  Departman
                </label>
                <select
                  id="departman"
                  name="departman"
                  value={form.departman}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Seçiniz</option>
                  <option value="IT">IT</option>
                  <option value="İK">İnsan Kaynakları</option>
                  <option value="Satış">Satış</option>
                  <option value="Pazarlama">Pazarlama</option>
                  <option value="Muhasebe">Muhasebe</option>
                  <option value="QA">Kalite Güvence</option>
                  <option value="Yönetim">Yönetim</option>
                </select>
              </div>

              <div>
                <label htmlFor="pozisyon" className="block text-sm font-medium text-gray-700 mb-2">
                  Pozisyon
                </label>
                <input
                  type="text"
                  id="pozisyon"
                  name="pozisyon"
                  value={form.pozisyon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Örn: Developer"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre *
              </label>
              <input
                type="password"
                id="sifre"
                name="sifre"
                required
                value={form.sifre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="En az 6 karakter"
              />
            </div>

            <div>
              <label htmlFor="sifreTekrar" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar *
              </label>
              <input
                type="password"
                id="sifreTekrar"
                name="sifreTekrar"
                required
                value={form.sifreTekrar}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.email.trim() || !form.sifre.trim() || !form.adSoyad.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Giriş Yap
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}