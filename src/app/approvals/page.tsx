'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
  tarih: string
}

interface ExtensionRequest {
  id: number
  yeniTarih: string
  talepYorumu: string | null
  talepTarihi: string
  talepEden: User
  aksiyon: {
    id: number
    baslik: string
    mevcutBitisTarihi: string | null
    toplanti: Meeting
  }
}

interface ActionApproval {
  id: number
  kullanici: User
  durum: string
  baslangicTarihi: string | null
  bitisTarihi: string | null
  aksiyon: {
    id: number
    baslik: string
    aciklama: string | null
    toplanti: Meeting
  }
}

interface ApprovalsData {
  extensionRequests: ExtensionRequest[]
  actionApprovals: ActionApproval[]
}

export default function ApprovalsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [approvalsData, setApprovalsData] = useState<ApprovalsData>({ extensionRequests: [], actionApprovals: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'extensions' | 'actions'>('extensions')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  const fetchApprovals = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/approvals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApprovalsData(data.data)
        } else {
          console.error('API error:', data.error)
        }
      } else {
        console.error('API request failed:', response.status)
      }
    } catch (error) {
      console.error('Approvals fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  // Ek süre talebi onay fonksiyonu
  const handleApproveExtensionRequest = async (extensionRequestId: number, approved: boolean) => {
    const cevapYorumu = prompt(approved ? 'Onay yorumunuz (isteğe bağlı):' : 'Red gerekçenizi belirtin:')
    if (!approved && !cevapYorumu) {
      alert('Red gerekçesi belirtmelisiniz.')
      return
    }

    try {
      const result = await fetch(`/api/actions/extension-requests/${extensionRequestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          approved,
          cevapYorumu
        }),
      })

      const data = await result.json()

      if (data.success) {
        alert(data.message)
        fetchApprovals() // Listeyi yenile
      } else {
        alert(data.error || 'İşlem gerçekleştirilirken hata oluştu')
      }
    } catch (error) {
      console.error('Extension request approval error:', error)
      alert('Bağlantı hatası oluştu')
    }
  }

  // Aksiyon onay fonksiyonu
  const handleApproveAction = async (actionId: number, responsibleId: number, approved: boolean) => {
    try {
      const result = await fetch('/api/actions/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          actionId,
          responsibleId,
          approved,
          comment: approved ? 'Yönetici tarafından onaylandı' : 'Yönetici tarafından reddedildi'
        })
      })

      const data = await result.json()
      if (data.success) {
        alert(approved ? 'Aksiyon onaylandı!' : 'Aksiyon reddedildi!')
        fetchApprovals() // Listeyi yenile
      } else {
        alert('İşlem başarısız: ' + data.error)
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('İşlem sırasında hata oluştu!')
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
          <p className="mt-4 text-gray-600">Onaylar yükleniyor...</p>
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
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-all group"
                title="Dashboard'a Geri Dön"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Onaylar</h1>
                <p className="text-sm text-gray-500">Bekleyen onay işlemleri</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {approvalsData.extensionRequests.length + approvalsData.actionApprovals.length} bekleyen işlem
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('extensions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'extensions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ek Süre Talepleri
                {approvalsData.extensionRequests.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                    {approvalsData.extensionRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'actions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Aksiyon Onayları
                {approvalsData.actionApprovals.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs">
                    {approvalsData.actionApprovals.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Extension Requests Tab */}
        {activeTab === 'extensions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Ek Süre Talepleri ({approvalsData.extensionRequests.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {approvalsData.extensionRequests.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen ek süre talebi yok</h3>
                    <p className="text-gray-500">Şu anda onayınızı bekleyen ek süre talebi bulunmuyor.</p>
                  </div>
                ) : (
                  approvalsData.extensionRequests.map((request) => (
                    <div key={request.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{request.aksiyon.baslik}</h3>
                            <Link
                              href={`/meetings/${request.aksiyon.toplanti.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              → Toplantıya Git
                            </Link>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Toplantı:</span> {request.aksiyon.toplanti.baslik}</p>
                            <p><span className="font-medium">Talep Eden:</span> {request.talepEden.adSoyad} ({request.talepEden.pozisyon})</p>
                            <p><span className="font-medium">Talep Tarihi:</span> {new Date(request.talepTarihi).toLocaleDateString('tr-TR')}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <p><span className="font-medium">Mevcut Bitiş:</span> {request.aksiyon.mevcutBitisTarihi ? new Date(request.aksiyon.mevcutBitisTarihi).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                              <p><span className="font-medium">Talep Edilen:</span> <span className="text-orange-600 font-medium">{new Date(request.yeniTarih).toLocaleDateString('tr-TR')}</span></p>
                            </div>
                            {request.talepYorumu && (
                              <p><span className="font-medium">Gerekçe:</span> {request.talepYorumu}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveExtensionRequest(request.id, false)}
                            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            Reddet
                          </button>
                          <button
                            onClick={() => handleApproveExtensionRequest(request.id, true)}
                            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                          >
                            Onayla
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Approvals Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Aksiyon Onayları ({approvalsData.actionApprovals.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {approvalsData.actionApprovals.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen aksiyon onayı yok</h3>
                    <p className="text-gray-500">Şu anda onayınızı bekleyen tamamlanmış aksiyon bulunmuyor.</p>
                  </div>
                ) : (
                  approvalsData.actionApprovals.map((approval) => (
                    <div key={approval.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{approval.aksiyon.baslik}</h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Tamamlandı
                            </span>
                            <Link
                              href={`/meetings/${approval.aksiyon.toplanti.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              → Toplantıya Git
                            </Link>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Toplantı:</span> {approval.aksiyon.toplanti.baslik}</p>
                            <p><span className="font-medium">Sorumlu:</span> {approval.kullanici.adSoyad} ({approval.kullanici.pozisyon})</p>
                            {approval.aksiyon.aciklama && (
                              <p><span className="font-medium">Açıklama:</span> {approval.aksiyon.aciklama}</p>
                            )}
                            {approval.baslangicTarihi && approval.bitisTarihi && (
                              <p><span className="font-medium">Süre:</span> {new Date(approval.baslangicTarihi).toLocaleDateString('tr-TR')} - {new Date(approval.bitisTarihi).toLocaleDateString('tr-TR')}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveAction(approval.aksiyon.id, approval.id, false)}
                            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            Reddet
                          </button>
                          <button
                            onClick={() => handleApproveAction(approval.aksiyon.id, approval.id, true)}
                            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                          >
                            Onayla
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}