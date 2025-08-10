'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function CompanyRegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    sirketAdi: '',
    sirketAciklamasi: '',
    website: '',
    yoneticiAdi: '',
    yoneticiEmail: '',
    yoneticiTelefon: '',
    yoneticiSifre: '',
    yoneticiSifreTekrar: ''
  })
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (form.yoneticiSifre !== form.yoneticiSifreTekrar) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (form.yoneticiSifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/company-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (data.success) {
        login(data.token, data.user)
        router.push('/dashboard') // Company admin goes to dashboard
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
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <img src="/logo.webp" alt="Meeting Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Şirket Kaydı</h1>
          <p className="text-gray-600 text-lg">Şirketinizi sisteme kaydedin ve toplantı yönetimini başlatın</p>
        </div>

        {/* Company Register Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
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

            {/* Şirket Bilgileri */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Şirket Bilgileri
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="sirketAdi" className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    id="sirketAdi"
                    name="sirketAdi"
                    required
                    value={form.sirketAdi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Örn: Acme Teknoloji A.Ş."
                  />
                </div>

                <div>
                  <label htmlFor="sirketAciklamasi" className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Açıklaması
                  </label>
                  <textarea
                    id="sirketAciklamasi"
                    name="sirketAciklamasi"
                    value={form.sirketAciklamasi}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Şirketinizin kısa açıklaması..."
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="https://www.sirketiniz.com"
                  />
                </div>
              </div>
            </div>

            {/* Yönetici Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-cyan-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Şirket Yöneticisi Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="yoneticiAdi" className="block text-sm font-medium text-gray-700 mb-2">
                    Yönetici Adı Soyadı *
                  </label>
                  <input
                    type="text"
                    id="yoneticiAdi"
                    name="yoneticiAdi"
                    required
                    value={form.yoneticiAdi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                </div>

                <div>
                  <label htmlFor="yoneticiTelefon" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="yoneticiTelefon"
                    name="yoneticiTelefon"
                    value={form.yoneticiTelefon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="0532 123 45 67"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="yoneticiEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi *
                  </label>
                  <input
                    type="email"
                    id="yoneticiEmail"
                    name="yoneticiEmail"
                    required
                    value={form.yoneticiEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="ahmet@sirketiniz.com"
                  />
                </div>

                <div>
                  <label htmlFor="yoneticiSifre" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre *
                  </label>
                  <input
                    type="password"
                    id="yoneticiSifre"
                    name="yoneticiSifre"
                    required
                    value={form.yoneticiSifre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="En az 6 karakter"
                  />
                </div>

                <div>
                  <label htmlFor="yoneticiSifreTekrar" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre Tekrar *
                  </label>
                  <input
                    type="password"
                    id="yoneticiSifreTekrar"
                    name="yoneticiSifreTekrar"
                    required
                    value={form.yoneticiSifreTekrar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Şifrenizi tekrar girin"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.sirketAdi.trim() || !form.yoneticiEmail.trim() || !form.yoneticiSifre.trim() || !form.yoneticiAdi.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-lg"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Şirket Kayıt Ediliyor...' : 'Şirketi Kaydet ve Başlat'}</span>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Şirketiniz zaten kayıtlı mı?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Giriş Yap
              </Link>
            </p>
            
            <p className="text-xs text-gray-500">
              Kayıt olduktan sonra şirket yöneticisi olarak çalışanlarınızı sisteme ekleyebileceksiniz.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}