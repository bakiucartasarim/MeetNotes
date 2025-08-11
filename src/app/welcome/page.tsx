'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function WelcomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.href = '/meetings'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img src="/logo.webp" alt="Meeting Logo" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Workcube Toplantı Modülü</h1>
                <p className="text-sm text-gray-500">Şirketler için Özel Toplantı Yönetim Sistemi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Şirketlere Özel Bilgi Kutucu */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-8 text-white text-center mb-16">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Şirketiniz İçin Tasarlandı</h2>
          <p className="text-xl text-slate-100 max-w-2xl mx-auto mb-6">
            Bu platform sadece kurumsal şirketlere özeldir. Önce şirketinizi kaydedin, 
            sonra çalışanlarınızı sisteme dahil ederek toplantı yönetimini başlatın.
          </p>
          <div className="inline-flex items-center bg-white/10 rounded-lg px-4 py-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Bireysel kullanıcılar için değil, sadece şirketler için</span>
          </div>
        </div>

        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Kurumsal Toplantı Yönetimi
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Çoklu kişi onay sistemi, kişi bazlı yorumlar, zaman çizelgesi ve gerçek zamanlı takip 
            özellikleri ile şirket toplantı süreçlerinizi dijitalleştirin.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-lg border-2 border-teal-200 p-6 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Yeni Şirket</h4>
            <p className="text-sm text-gray-600 mb-4">Şirketinizi sisteme kaydedin ve yönetici hesabı oluşturun</p>
            <Link 
              href="/company-register" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Şirket Kaydet</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Mevcut Hesap</h4>
            <p className="text-sm text-gray-600 mb-4">Şirketiniz zaten kayıtlıysa, giriş yapın</p>
            <Link 
              href="/login" 
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Giriş Yap</span>
            </Link>
          </div>
        </div>

        {/* Nasıl Çalışır */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Nasıl Çalışır?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Şirket Kaydı</h4>
              <p className="text-sm text-gray-600">Şirketinizi sisteme kaydedin ve yönetici hesabınız otomatik oluşturulsun</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Çalışan Ekleme</h4>
              <p className="text-sm text-gray-600">Yönetici olarak şirketinizdeki çalışanları sisteme davet edin</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Toplantı Yönetimi</h4>
              <p className="text-sm text-gray-600">Toplantılarınızı oluşturun, takip edin ve onay süreçlerini yönetin</p>
            </div>
          </div>
        </div>

        {/* Demo Login */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-16 text-center">
          <div className="flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-800">Demo Hesaplar Mevcut</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            Sistemi test etmek için demo şirket hesaplarıyla giriş yapabilirsiniz
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-yellow-200">
              <p className="font-medium text-gray-900">Şirket Yöneticisi</p>
              <p className="text-gray-600">ahmet@workcube.com</p>
              <p className="text-gray-600">Şifre: 123456</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-yellow-200">
              <p className="font-medium text-gray-900">Çalışan</p>
              <p className="text-gray-600">fatma@workcube.com</p>
              <p className="text-gray-600">Şifre: 123456</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-yellow-200">
              <p className="font-medium text-gray-900">Çalışan</p>
              <p className="text-gray-600">ayse@workcube.com</p>
              <p className="text-gray-600">Şifre: 123456</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Çoklu Kişi Onay</h3>
            <p className="text-gray-600">Her aksiyon maddesi için birden fazla sorumlu kişi atayın ve kişi bazlı onay sistemi ile şeffaf süreç yönetimi.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Zaman Çizelgesi</h3>
            <p className="text-gray-600">Her aksiyon için başlangıç ve bitiş tarihleri belirleyin. Gerçek zamanlı progress bar ile ilerleme takibi.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kişi Bazlı Yorumlar</h3>
            <p className="text-gray-600">Sorumlu kişiler onay verirken yorum ekleyebilir. Tüm süreç şeffaf ve takip edilebilir.</p>
          </div>
        </div>


        {/* Tech Stack */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-8">Teknoloji Stack</h3>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">▲</span>
              </div>
              <span className="text-sm font-medium">Next.js 15</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">TS</span>
              </div>
              <span className="text-sm font-medium">TypeScript</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">◐</span>
              </div>
              <span className="text-sm font-medium">PostgreSQL</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-sm font-medium">Prisma ORM</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">TW</span>
              </div>
              <span className="text-sm font-medium">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}