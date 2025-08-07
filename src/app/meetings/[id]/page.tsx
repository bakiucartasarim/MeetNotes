'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
// import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: number
  adSoyad: string
  email: string
  departman: string
  pozisyon: string
}

interface ActionResponsible {
  id: number
  kullaniciId: number
  rol: string
  onaylandi: boolean
  onayTarihi: string | null
  yorum: string | null
  kullanici: User
}

interface Action {
  id: number
  baslik: string
  aciklama: string
  durum: string
  baslangicTarihi: string | null
  bitisTarihi: string | null
  oncelik: string
  olusturmaTarihi: string
  sorumluKisiler: ActionResponsible[]
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
  aksiyonlar: Action[]
}

export default function MeetingDetailPage() {
  const params = useParams()
  // const router = useRouter() // Will be used for future features
  const meetingId = params.id as string
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [newActionModal, setNewActionModal] = useState(false)
  const [commentModal, setCommentModal] = useState<{actionId: number, responsibleId: number} | null>(null)
  const [comment, setComment] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  // New Action Form
  const [newAction, setNewAction] = useState({
    baslik: '',
    aciklama: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    oncelik: 'orta' as string,
    sorumluKisiler: [] as Array<{kullaniciId: number, rol: string}>
  })

  const fetchMeetingDetail = useCallback(async () => {
    if (!user?.id || !meetingId) return

    try {
      const response = await fetch(`/api/meetings/${meetingId}?kullanici_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMeeting(data.data)
        } else {
          console.error('API error:', data.error)
          setMeeting(null)
        }
      } else if (response.status === 403) {
        // User doesn't have access to this meeting
        setMeeting(null)
      } else {
        console.error('API request failed:', response.status)
        setMeeting(null)
      }
    } catch (error) {
      console.error('Meeting detail fetch error:', error)
      setMeeting(null)
    } finally {
      setLoading(false)
    }
  }, [meetingId, user])

  useEffect(() => {
    fetchMeetingDetail()
  }, [fetchMeetingDetail])

  const handleApproveAction = async (actionId: number, responsibleId: number, approved: boolean, comment: string = '') => {
    if (!meeting) return

    try {
      const response = await fetch('/api/actions/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          actionId,
          responsibleId,
          approved,
          comment
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh meeting data
          fetchMeetingDetail()
          setCommentModal(null)
          setComment('')
          
          if (approved) {
            alert('Onay başarıyla kaydedildi!')
          } else {
            alert('Red işlemi kaydedildi!')
          }
        } else {
          alert('İşlem başarısız: ' + data.error)
        }
      } else {
        alert('İşlem sırasında hata oluştu!')
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('İşlem sırasında hata oluştu!')
    }
  }

  const handleAddAction = async () => {
    if (!meeting || !newAction.baslik.trim()) return

    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toplantiId: meeting.id,
          ...newAction
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh meeting data
          fetchMeetingDetail()
          setNewActionModal(false)
          setNewAction({
            baslik: '',
            aciklama: '',
            baslangicTarihi: '',
            bitisTarihi: '',
            oncelik: 'orta',
            sorumluKisiler: []
          })
          
          alert('Aksiyon başarıyla eklendi!')
        } else {
          alert('Aksiyon eklenemedi: ' + data.error)
        }
      } else {
        alert('Aksiyon eklenirken hata oluştu!')
      }
    } catch (error) {
      console.error('Add action error:', error)
      alert('Aksiyon eklenirken hata oluştu!')
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'kritik': return 'bg-red-100 text-red-800'
      case 'yuksek': return 'bg-orange-100 text-orange-800'
      case 'orta': return 'bg-blue-100 text-blue-800'
      case 'dusuk': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (action: Action) => {
    const total = action.sorumluKisiler.length
    const completed = action.sorumluKisiler.filter(r => r.onaylandi).length
    return total > 0 ? (completed / total) * 100 : 0
  }

  const getTimeProgressPercentage = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0
    
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    
    if (now <= start) return 0
    if (now >= end) return 100
    
    return ((now - start) / (end - start)) * 100
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
          <p className="mt-4 text-gray-600">Toplantı detayları yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Toplantı bulunamadı veya erişim yetkiniz yok</p>
          <p className="text-sm text-gray-500 mt-2">Bu toplantıya erişim için oluşturan, katılımcı veya aksiyon sorumlusu olmalısınız.</p>
          <Link href="/meetings" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Toplantılara Dön
          </Link>
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
              <Link href="/meetings" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Toplantılara Dön</span>
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{meeting.baslik}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.durum)}`}>
                    {meeting.durum === 'aktif' ? 'Aktif' : meeting.durum === 'tamamlandi' ? 'Tamamlandı' : 'İptal'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(meeting.tarih).toLocaleDateString('tr-TR')} - {meeting.saat} ({meeting.sure} dakika)
                </p>
              </div>
            </div>
            <button
              onClick={() => setNewActionModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Yeni Aksiyon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Meeting Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Meeting Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Toplantı Bilgileri</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Açıklama</h3>
                  <p className="mt-1 text-gray-900">{meeting.aciklama}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tarih</h3>
                    <p className="mt-1 text-gray-900">{new Date(meeting.tarih).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Saat</h3>
                    <p className="mt-1 text-gray-900">{meeting.saat}</p>
                  </div>
                </div>

                {meeting.konum && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Konum</h3>
                    <p className="mt-1 text-gray-900 flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{meeting.konum}</span>
                    </p>
                  </div>
                )}

                {meeting.onlineLink && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Online Link</h3>
                    <a 
                      href={meeting.onlineLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      </svg>
                      <span>Toplantıya Katıl</span>
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Oluşturan</h3>
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {meeting.olusturan.adSoyad.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{meeting.olusturan.adSoyad}</p>
                      <p className="text-xs text-gray-500">{meeting.olusturan.pozisyon}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Katılımcılar ({meeting.katilimcilar.length})</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {meeting.katilimcilar.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {participant.kullanici.adSoyad.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{participant.kullanici.adSoyad}</p>
                          <p className="text-xs text-gray-500">{participant.kullanici.pozisyon}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        participant.katilimDurumu === 'kabul' ? 'bg-green-100 text-green-800' :
                        participant.katilimDurumu === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.katilimDurumu === 'kabul' ? 'Kabul' :
                         participant.katilimDurumu === 'red' ? 'Red' : 'Beklemede'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Aksiyon Maddeleri ({meeting.aksiyonlar.length})</h2>
                  <div className="text-sm text-gray-500">
                    {meeting.aksiyonlar.filter(a => a.durum === 'tamamlandi').length} / {meeting.aksiyonlar.length} Tamamlandı
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {meeting.aksiyonlar.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz aksiyon yok</h3>
                    <p className="text-gray-500 mb-6">Bu toplantı için henüz aksiyon maddesi eklenmemiş.</p>
                    <button
                      onClick={() => setNewActionModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      İlk Aksiyonu Ekle
                    </button>
                  </div>
                ) : (
                  meeting.aksiyonlar.map((action) => (
                    <div key={action.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{action.baslik}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionStatusColor(action.durum)}`}>
                              {action.durum === 'tamamlandi' ? 'Tamamlandı' : 
                               action.durum === 'devam_ediyor' ? 'Devam Ediyor' : 
                               action.durum === 'beklemede' ? 'Beklemede' : 'İptal'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.oncelik)}`}>
                              {action.oncelik === 'kritik' ? 'Kritik' :
                               action.oncelik === 'yuksek' ? 'Yüksek' :
                               action.oncelik === 'orta' ? 'Orta' : 'Düşük'} Öncelik
                            </span>
                          </div>
                          
                          {action.aciklama && (
                            <p className="text-gray-600 mb-3">{action.aciklama}</p>
                          )}

                          {/* Date Range & Progress */}
                          {action.baslangicTarihi && action.bitisTarihi && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <span>Başlangıç: {new Date(action.baslangicTarihi).toLocaleDateString('tr-TR')}</span>
                                <span>Bitiş: {new Date(action.bitisTarihi).toLocaleDateString('tr-TR')}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${getTimeProgressPercentage(action.baslangicTarihi, action.bitisTarihi)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Person Approval Progress */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                              <span>Kişi Bazlı Onay İlerlemesi</span>
                              <span>{action.sorumluKisiler.filter(r => r.onaylandi).length} / {action.sorumluKisiler.length} Onaylandı</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage(action)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Responsible People */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900">Sorumlu Kişiler:</h4>
                            {action.sorumluKisiler.map((responsible) => (
                              <div key={responsible.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                      {responsible.kullanici.adSoyad.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{responsible.kullanici.adSoyad}</p>
                                      <p className="text-sm text-gray-500">{responsible.rol}</p>
                                      {responsible.onaylandi && responsible.onayTarihi && (
                                        <p className="text-xs text-green-600">
                                          ✓ {new Date(responsible.onayTarihi).toLocaleDateString('tr-TR')} tarihinde onaylandı
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    {responsible.onaylandi ? (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Onaylandı
                                      </span>
                                    ) : (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleApproveAction(action.id, responsible.id, false)}
                                          className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                        >
                                          ✗ Reddet
                                        </button>
                                        <button
                                          onClick={() => setCommentModal({ actionId: action.id, responsibleId: responsible.id })}
                                          className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                        >
                                          ✓ Onayla
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {responsible.yorum && (
                                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">Yorum:</span> {responsible.yorum}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Onay Yorumu</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Onay yorumunuzu yazın (isteğe bağlı)..."
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setCommentModal(null)
                  setComment('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleApproveAction(commentModal.actionId, commentModal.responsibleId, true, comment)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Action Modal */}
      {newActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Aksiyon Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={newAction.baslik}
                  onChange={(e) => setNewAction({...newAction, baslik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aksiyon başlığını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={newAction.aciklama}
                  onChange={(e) => setNewAction({...newAction, aciklama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Aksiyon detayları..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={newAction.baslangicTarihi}
                    onChange={(e) => setNewAction({...newAction, baslangicTarihi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={newAction.bitisTarihi}
                    onChange={(e) => setNewAction({...newAction, bitisTarihi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öncelik
                </label>
                <select
                  value={newAction.oncelik}
                  onChange={(e) => setNewAction({...newAction, oncelik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dusuk">Düşük</option>
                  <option value="orta">Orta</option>
                  <option value="yuksek">Yüksek</option>
                  <option value="kritik">Kritik</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sorumlu Kişiler
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {meeting?.katilimcilar.map((participant) => (
                    <label key={participant.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAction.sorumluKisiler.some(s => s.kullaniciId === participant.kullanici.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAction({
                              ...newAction,
                              sorumluKisiler: [...newAction.sorumluKisiler, {
                                kullaniciId: participant.kullanici.id,
                                rol: participant.kullanici.pozisyon
                              }]
                            })
                          } else {
                            setNewAction({
                              ...newAction,
                              sorumluKisiler: newAction.sorumluKisiler.filter(s => s.kullaniciId !== participant.kullanici.id)
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {participant.kullanici.adSoyad.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm">{participant.kullanici.adSoyad}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setNewActionModal(false)
                  setNewAction({
                    baslik: '',
                    aciklama: '',
                    baslangicTarihi: '',
                    bitisTarihi: '',
                    oncelik: 'orta',
                    sorumluKisiler: []
                  })
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddAction}
                disabled={!newAction.baslik.trim() || newAction.sorumluKisiler.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Aksiyon Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}