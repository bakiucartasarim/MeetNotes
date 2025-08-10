'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { login, user, isAuthenticated, loading: authLoading } = useAuth()
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

  // Redirect unauthenticated users or non-admin users
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      if (user && user.rol !== 'YONETICI') {
        router.push('/meetings')
        return
      }
    }
  }, [isAuthenticated, authLoading, user, router])

  useEffect(() => {
    if (isAuthenticated && user && user.rol === 'YONETICI') {
      fetchCompanies()
    }
  }, [isAuthenticated, user])

  const fetchCompanies = async () => {
    try {
      // Yönetici sadece kendi şirketini görür, ancak API henüz bu kontrolü yapmıyor
      // Şimdilik mevcut şirketi otomatik seçelim
      if (user && user.sirket) {
        setCompanies([{ id: user.sirketId, ad: user.sirket.ad }])
        setForm(prev => ({ ...prev, sirketId: user.sirketId.toString() }))
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Show loading if user is not admin
  if (!user || user.rol !== 'YONETICI') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
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
          sirketId: user?.sirketId
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <img src="/logo.webp" alt="Meeting Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Çalışan Ekle</h1>
          <p className="text-gray-600">Şirketinize yeni çalışan ekleyin</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="ornek@sirket.com"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-semibold text-slate-800">Önemli Bilgi</h4>
              </div>
              <p className="text-sm text-slate-700">
                Bu sayfa sadece şirket yöneticileri içindir. Yönetici olarak şirketinize yeni çalışanlar ekleyebilirsiniz. 
                Eklenen çalışanlar sisteme giriş yapabilir ve toplantılara katılabilir.
              </p>
            </div>

            <div>
              <label htmlFor="sirketInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Şirket
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-700 font-medium">
                  {user?.sirket?.ad || 'Şirket bilgisi yükleniyor...'}
                </p>
                <p className="text-sm text-gray-500">
                  Bu şirkete çalışan ekleyeceksiniz
                </p>
              </div>
            </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.email.trim() || !form.sifre.trim() || !form.adSoyad.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Çalışan Ekleniyor...' : 'Çalışanı Sisteme Ekle'}</span>
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Çalışan ekleme işlemi tamamlandı mı?{' '}
              <Link href="/meetings" className="text-teal-600 hover:text-teal-700 font-medium">
                Toplantılar Sayfasına Git
              </Link>
            </p>
            <p className="text-sm text-gray-500 text-xs">
              Yönetici panelinden şirketinizin tüm çalışanlarını yönetebilirsiniz.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full transition-all group"
              title="Ana Sayfaya Geri Dön"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}