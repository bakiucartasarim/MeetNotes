'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
// import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: number
  adSoyad: string
  email: string
  departman: string
  pozisyon: string
}

interface MeetingForm {
  baslik: string
  aciklama: string
  tarih: string
  saat: string
  sure: number
  konum: string
  onlineLink: string
  katilimcilar: number[]
}

export default function NewMeetingPage() {
  // const router = useRouter() // Will be used for future features
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])
  const [form, setForm] = useState<MeetingForm>({
    baslik: '',
    aciklama: '',
    tarih: '',
    saat: '',
    sure: 60,
    konum: '',
    onlineLink: '',
    katilimcilar: []
  })

  useEffect(() => {
    if (user?.sirketId) {
      fetchUsers()
    }
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setForm(prev => ({
      ...prev,
      tarih: tomorrow.toISOString().split('T')[0]
    }))
  }, [user])

  const fetchUsers = async () => {
    if (!user?.sirketId) return

    try {
      const response = await fetch(`/api/users?sirket_id=${user.sirketId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.data)
        } else {
          console.error('API error:', data.error)
          setUsers([])
        }
      } else {
        console.error('API request failed:', response.status)
        setUsers([])
      }
    } catch (error) {
      console.error('Users fetch error:', error)
      setUsers([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleParticipantToggle = (userId: number) => {
    setForm(prev => ({
      ...prev,
      katilimcilar: prev.katilimcilar.includes(userId)
        ? prev.katilimcilar.filter(id => id !== userId)
        : [...prev.katilimcilar, userId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user?.id) {
        alert('Kullanıcı bilgisi bulunamadı!')
        return
      }

      const meetingData = {
        ...form,
        olusturanId: user.id
      }

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(meetingData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Toplantı başarıyla oluşturuldu!')
          window.location.href = '/meetings'
        } else {
          alert('Toplantı oluşturulamadı: ' + data.error)
        }
      } else {
        alert('Toplantı oluşturulurken hata oluştu!')
      }
    } catch (error) {
      console.error('Meeting creation error:', error)
      alert('Toplantı oluşturulurken hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/meetings" 
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-all group"
                title="Toplantılara Geri Dön"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni Toplantı</h1>
                <p className="text-sm text-gray-500">Toplantı detaylarını girin ve katılımcıları seçin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="baslik" className="block text-sm font-medium text-gray-700 mb-2">
                  Toplantı Başlığı *
                </label>
                <input
                  type="text"
                  id="baslik"
                  name="baslik"
                  required
                  value={form.baslik}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Haftalık proje değerlendirmesi"
                />
              </div>

              <div>
                <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  id="aciklama"
                  name="aciklama"
                  rows={4}
                  value={form.aciklama}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Toplantı hakkında detaylar..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="tarih" className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    id="tarih"
                    name="tarih"
                    required
                    value={form.tarih}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="saat" className="block text-sm font-medium text-gray-700 mb-2">
                    Saat *
                  </label>
                  <input
                    type="time"
                    id="saat"
                    name="saat"
                    required
                    value={form.saat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="sure" className="block text-sm font-medium text-gray-700 mb-2">
                    Süre (dakika)
                  </label>
                  <select
                    id="sure"
                    name="sure"
                    value={form.sure}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>1 saat</option>
                    <option value={90}>1.5 saat</option>
                    <option value={120}>2 saat</option>
                    <option value={180}>3 saat</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Konum</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="konum" className="block text-sm font-medium text-gray-700 mb-2">
                    Fiziksel Konum
                  </label>
                  <input
                    type="text"
                    id="konum"
                    name="konum"
                    value={form.konum}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Toplantı Salonu A, Ofis B"
                  />
                </div>

                <div>
                  <label htmlFor="onlineLink" className="block text-sm font-medium text-gray-700 mb-2">
                    Online Toplantı Linki
                  </label>
                  <input
                    type="url"
                    id="onlineLink"
                    name="onlineLink"
                    value={form.onlineLink}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              {(form.konum || form.onlineLink) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Toplantı Detayları</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        {form.konum && <p>📍 Konum: {form.konum}</p>}
                        {form.onlineLink && <p>🔗 Online: {form.onlineLink}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Katılımcılar</h2>
              <p className="text-sm text-gray-500 mt-1">Toplantıya katılacak kişileri seçin</p>
            </div>
            <div className="p-6">
              {form.katilimcilar.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    Seçilen Katılımcılar ({form.katilimcilar.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {users
                      .filter(user => form.katilimcilar.includes(user.id))
                      .map(user => (
                        <span
                          key={user.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {user.adSoyad}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {users.map(user => (
                  <div
                    key={user.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      form.katilimcilar.includes(user.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleParticipantToggle(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={form.katilimcilar.includes(user.id)}
                          onChange={() => handleParticipantToggle(user.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {user.adSoyad.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.adSoyad}</p>
                          <p className="text-sm text-gray-500">{user.pozisyon} • {user.departman}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/meetings"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading || !form.baslik.trim() || !form.tarih || !form.saat}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Oluşturuluyor...' : 'Toplantı Oluştur'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}