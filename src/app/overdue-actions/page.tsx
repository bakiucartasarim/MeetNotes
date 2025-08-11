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
  olusturan: User
}

interface OverdueAction {
  id: number
  kullanici: User
  durum: string
  rol: string
  baslangicTarihi: string | null
  bitisTarihi: string | null
  gecikmeGunu: number
  aksiyon: {
    id: number
    baslik: string
    aciklama: string | null
    oncelik: string
    toplanti: Meeting
  }
}

interface OverdueData {
  overdueActions: OverdueAction[]
  totalCount: number
  criticalCount: number
  highPriorityCount: number
}

export default function OverdueActionsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [overdueData, setOverdueData] = useState<OverdueData>({ 
    overdueActions: [], 
    totalCount: 0, 
    criticalCount: 0, 
    highPriorityCount: 0 
  })
  const [loading, setLoading] = useState(true)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  const fetchOverdueActions = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/overdue-actions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOverdueData(data.data)
        } else {
          console.error('API error:', data.error)
        }
      } else {
        console.error('API request failed:', response.status)
      }
    } catch (error) {
      console.error('Overdue actions fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOverdueActions()
  }, [fetchOverdueActions])

  // Filtrelenmiş aksiyonlar
  const filteredActions = overdueData.overdueActions.filter(action => {
    const priorityMatch = filterPriority === 'all' || action.aksiyon.oncelik === filterPriority
    const userMatch = filterUser === 'all' || action.kullanici.id.toString() === filterUser
    return priorityMatch && userMatch
  })

  // Unique users for filter
  const uniqueUsers = Array.from(
    new Map(overdueData.overdueActions.map(action => [action.kullanici.id, action.kullanici]))
      .values()
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'kritik': return 'bg-red-100 text-red-800 border-red-200'
      case 'yuksek': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'orta': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'dusuk': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDelayColor = (days: number) => {
    if (days <= 1) return 'text-yellow-600'
    if (days <= 7) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'devam_ediyor': return 'bg-yellow-100 text-yellow-800'
      case 'beklemede': return 'bg-gray-100 text-gray-800'
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
          <p className="mt-4 text-gray-600">Geciken aksiyonlar yükleniyor...</p>
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
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg className="w-8 h-8 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Geciken Aksiyonlar
                </h1>
                <p className="text-sm text-gray-500">Tarihi geçen ve tamamlanmamış aksiyonlar</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{overdueData.totalCount}</p>
                <p className="text-xs text-gray-500">Toplam Geciken</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.846-.833-2.616 0L5.198 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kritik Öncelik</p>
                <p className="text-2xl font-bold text-red-600">{overdueData.criticalCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Yüksek Öncelik</p>
                <p className="text-2xl font-bold text-orange-600">{overdueData.highPriorityCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Geciken</p>
                <p className="text-2xl font-bold text-gray-900">{overdueData.totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="kritik">Kritik</option>
                <option value="yuksek">Yüksek</option>
                <option value="orta">Orta</option>
                <option value="dusuk">Düşük</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sorumlu Kişi</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">Tüm Kullanıcılar</option>
                {uniqueUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.adSoyad}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto">
              <p className="text-sm text-gray-600">
                Gösterilen: <span className="font-medium">{filteredActions.length}</span> / {overdueData.totalCount}
              </p>
            </div>
          </div>
        </div>

        {/* Overdue Actions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Geciken Aksiyonlar ({filteredActions.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredActions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Harika! Geciken aksiyon yok</h3>
                <p className="text-gray-500">Seçtiğiniz kriterlere göre geciken aksiyon bulunmuyor.</p>
              </div>
            ) : (
              filteredActions.map((action) => (
                <div key={action.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{action.aksiyon.baslik}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.aksiyon.oncelik)}`}>
                          {action.aksiyon.oncelik === 'kritik' ? 'KRİTİK' :
                           action.aksiyon.oncelik === 'yuksek' ? 'YÜKSEK' :
                           action.aksiyon.oncelik === 'orta' ? 'ORTA' : 'DÜŞÜK'} ÖNCELİK
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.durum)}`}>
                          {action.durum === 'devam_ediyor' ? 'Devam Ediyor' : 'Beklemede'}
                        </span>
                        <Link
                          href={`/meetings/${action.aksiyon.toplanti.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          → Toplantıya Git
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Toplantı:</span>
                          <p>{action.aksiyon.toplanti.baslik}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Sorumlu:</span>
                          <p>{action.kullanici.adSoyad}</p>
                          <p className="text-xs text-gray-500">{action.kullanici.pozisyon}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Bitiş Tarihi:</span>
                          <p>{action.bitisTarihi ? new Date(action.bitisTarihi).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Gecikme:</span>
                          <p className={`font-bold ${getDelayColor(action.gecikmeGunu)}`}>
                            {action.gecikmeGunu} gün
                          </p>
                        </div>
                      </div>

                      {action.aksiyon.aciklama && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                          <span className="font-medium">Açıklama:</span> {action.aksiyon.aciklama}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-6">
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getDelayColor(action.gecikmeGunu)}`}>
                          {action.gecikmeGunu}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          GÜN GECİKME
                        </div>
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
  )
}