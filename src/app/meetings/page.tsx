'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: number
  adSoyad: string
  email: string
  departman: string
  pozisyon: string
}

interface Meeting {
  id: number
  baslik: string
  aciklama: string
  tarih: string
  saat: string
  sure: number
  durum: string
  konum?: string
  onlineLink?: string
  olusturan: User
  katilimcilar: Array<{
    id: number
    katilimDurumu: string
    kullanici: User
  }>
  aksiyonlar: Array<{
    id: number
    baslik: string
    durum: string
  }>
}

export default function MeetingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  const fetchMeetings = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/meetings?kullanici_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMeetings(data.data)
        } else {
          console.error('API error:', data.error)
          setMeetings([])
        }
      } else {
        console.error('API request failed:', response.status)
        setMeetings([])
      }
    } catch (error) {
      console.error('Meetings fetch error:', error)
      setMeetings([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user, fetchMeetings])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800'
      case 'iptal': return 'bg-red-100 text-red-800'
      case 'tamamlandi': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'tamamlandi': return 'bg-green-100 text-green-800'
      case 'devam_ediyor': return 'bg-yellow-100 text-yellow-800'
      case 'beklemede': return 'bg-gray-100 text-gray-800'
      case 'iptal': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Toplantılar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Geri Butonu - Yönetici ise dashboard'a, çalışan ise ana sayfaya */}
              <Link 
                href={user?.rol === 'YONETICI' ? '/dashboard' : '/'} 
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-all group"
                title={user?.rol === 'YONETICI' ? "Dashboard'a Geri Dön" : "Ana Sayfaya Geri Dön"}
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <img src="/logo.webp" alt="Meeting Logo" className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Toplantılar</h1>
                  <p className="text-sm text-gray-500">Hoş geldiniz, {user?.adSoyad}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Hoş geldiniz, <span className="font-medium">{user?.adSoyad}</span>
              </div>
              
              {/* Onaylar butonu - sadece yöneticiler ve toplantı sahipleri için */}
              {user?.rol === 'YONETICI' && (
                <Link
                  href="/approvals"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Onaylar</span>
                </Link>
              )}
              
              <Link
                href="/meetings/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Yeni Toplantı</span>
              </Link>
              <button
                onClick={() => {
                  logout()
                  document.cookie = 'token=; path=/; max-age=0' // Clear cookie
                  router.push('/welcome')
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8V9m0 0V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2m8 8v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz toplantı yok</h3>
            <p className="text-gray-500 mb-6">İlk toplantınızı oluşturmak için başlayın.</p>
            <Link
              href="/meetings/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              İlk Toplantıyı Oluştur
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Toplam</p>
                    <p className="text-2xl font-semibold text-gray-900">{meetings.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Aktif</p>
                    <p className="text-2xl font-semibold text-gray-900">{meetings.filter(m => m.durum === 'aktif').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Bekleyen Aksiyonlar</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {meetings.reduce((acc, m) => acc + m.aksiyonlar.filter(a => a.durum === 'beklemede').length, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Katılımcı</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {meetings.reduce((acc, m) => acc + m.katilimcilar.length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meetings List */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Toplantı Listesi</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Link 
                            href={`/meetings/${meeting.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {meeting.baslik}
                          </Link>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.durum)}`}>
                            {meeting.durum === 'aktif' ? 'Aktif' : meeting.durum === 'tamamlandi' ? 'Tamamlandı' : 'İptal'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{meeting.aciklama}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8V9" />
                            </svg>
                            <span>{new Date(meeting.tarih).toLocaleDateString('tr-TR')} - {meeting.saat}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                            </svg>
                            <span>{meeting.sure} dakika</span>
                          </div>
                          
                          {meeting.konum && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{meeting.konum}</span>
                            </div>
                          )}
                          
                          {meeting.onlineLink && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <span>Online Toplantı</span>
                            </div>
                          )}
                        </div>

                        {/* Participants */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-sm text-gray-500">Katılımcılar:</span>
                          <div className="flex -space-x-2">
                            {meeting.katilimcilar.slice(0, 3).map((participant) => (
                              <div
                                key={participant.id}
                                className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                title={participant.kullanici.adSoyad}
                              >
                                {participant.kullanici.adSoyad.split(' ').map(n => n[0]).join('')}
                              </div>
                            ))}
                            {meeting.katilimcilar.length > 3 && (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                                +{meeting.katilimcilar.length - 3}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Items */}
                        {meeting.aksiyonlar.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm text-gray-500">Aksiyonlar:</span>
                            <div className="space-y-1">
                              {meeting.aksiyonlar.map((action) => (
                                <div key={action.id} className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionStatusColor(action.durum)}`}>
                                    {action.durum === 'tamamlandi' ? 'Tamamlandı' : 
                                     action.durum === 'devam_ediyor' ? 'Devam Ediyor' : 
                                     action.durum === 'beklemede' ? 'Beklemede' : 'İptal'}
                                  </span>
                                  <span className="text-sm text-gray-700">{action.baslik}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 flex flex-col space-y-2">
                        <Link
                          href={`/meetings/${meeting.id}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
                        >
                          <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detayları Görüntüle
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}