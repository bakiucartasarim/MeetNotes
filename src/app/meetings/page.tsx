'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      // Demo data - gerçek API'de /api/meetings?kullanici_id=${currentUser.id} kullanılacak
      const demoMeetings: Meeting[] = [
        {
          id: 1,
          baslik: 'Haftalık Proje Değerlendirmesi',
          aciklama: 'Sprint sonucu ve gelecek hafta planlaması',
          tarih: '2025-08-10',
          saat: '14:00',
          sure: 90,
          durum: 'aktif',
          konum: 'Toplantı Salonu A',
          olusturan: { id: 1, adSoyad: 'Ahmet Yılmaz', email: 'ahmet@workcube.com', departman: 'IT', pozisyon: 'Proje Yöneticisi' },
          katilimcilar: [
            { id: 1, katilimDurumu: 'kabul', kullanici: { id: 2, adSoyad: 'Fatma Kaya', email: 'fatma@workcube.com', departman: 'IT', pozisyon: 'Developer' } },
            { id: 2, katilimDurumu: 'beklemede', kullanici: { id: 3, adSoyad: 'Mehmet Öz', email: 'mehmet@workcube.com', departman: 'IT', pozisyon: 'QA' } }
          ],
          aksiyonlar: [
            { id: 1, baslik: 'API dokümantasyonu güncelleme', durum: 'beklemede' },
            { id: 2, baslik: 'Test senaryoları yazılması', durum: 'devam_ediyor' }
          ]
        },
        {
          id: 2,
          baslik: 'Müşteri Geri Bildirim Toplantısı',
          aciklama: 'Q4 müşteri memnuniyet anketleri değerlendirmesi',
          tarih: '2025-08-12',
          saat: '10:30',
          sure: 60,
          durum: 'aktif',
          onlineLink: 'https://meet.google.com/abc-def-ghi',
          olusturan: { id: 2, adSoyad: 'Ayşe Demir', email: 'ayse@workcube.com', departman: 'Pazarlama', pozisyon: 'Pazarlama Müdürü' },
          katilimcilar: [
            { id: 3, katilimDurumu: 'kabul', kullanici: { id: 1, adSoyad: 'Ahmet Yılmaz', email: 'ahmet@workcube.com', departman: 'IT', pozisyon: 'Proje Yöneticisi' } }
          ],
          aksiyonlar: [
            { id: 3, baslik: 'Anket sonuçlarının analizi', durum: 'tamamlandi' }
          ]
        }
      ]
      
      setMeetings(demoMeetings)
    } catch (error) {
      console.error('Meetings fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

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
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Ana Sayfa</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Toplantılarım</h1>
                <p className="text-sm text-gray-500">Kullanıcı: {user?.adSoyad}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Hoş geldiniz, <span className="font-medium">{user?.adSoyad}</span>
              </div>
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
                  router.push('/login')
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8V9" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857" />
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
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Detaylar →
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