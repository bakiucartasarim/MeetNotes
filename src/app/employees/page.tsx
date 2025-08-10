'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Employee {
  id: number
  adSoyad: string
  email: string
  departman?: string
  pozisyon?: string
  rol: 'YONETICI' | 'CALISAN'
  olusturmaTarihi: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    adSoyad: '',
    email: '',
    sifre: '',
    departman: '',
    pozisyon: ''
  })

  // Redirect if not authenticated or not admin
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
      fetchEmployees()
    }
  }, [isAuthenticated, user])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      // TODO: API endpoint for company employees
      // Şimdilik mock data
      const mockEmployees: Employee[] = [
        {
          id: 1,
          adSoyad: 'Ahmet Yılmaz',
          email: 'ahmet@workcube.com',
          departman: 'Yönetim',
          pozisyon: 'Proje Yöneticisi',
          rol: 'YONETICI',
          olusturmaTarihi: '2024-01-15'
        },
        {
          id: 2,
          adSoyad: 'Fatma Kaya',
          email: 'fatma@workcube.com',
          departman: 'IT',
          pozisyon: 'Senior Developer',
          rol: 'CALISAN',
          olusturmaTarihi: '2024-02-20'
        },
        {
          id: 3,
          adSoyad: 'Ayşe Demir',
          email: 'ayse@workcube.com',
          departman: 'QA',
          pozisyon: 'QA Engineer',
          rol: 'CALISAN',
          olusturmaTarihi: '2024-03-10'
        }
      ]
      setEmployees(mockEmployees)
    } catch (error) {
      console.error('Employees fetch error:', error)
      setError('Çalışanlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEmployeeForm(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setMessage('')
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    if (newEmployeeForm.sifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setSaving(false)
      return
    }

    try {
      // TODO: API endpoint for adding employee
      const response = await fetch('/api/employees/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newEmployeeForm,
          sirketId: user?.sirketId
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Çalışan başarıyla eklendi')
        setNewEmployeeForm({
          adSoyad: '',
          email: '',
          sifre: '',
          departman: '',
          pozisyon: ''
        })
        setShowAddForm(false)
        fetchEmployees() // Listeyi yenile
      } else {
        setError(data.error || 'Çalışan eklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Add employee error:', error)
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      // API endpoint for deleting employee
      const response = await fetch('/api/employees/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Çalışan başarıyla silindi')
        fetchEmployees() // Listeyi yenile
      } else {
        setError(data.error || 'Çalışan silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Delete employee error:', error)
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
    }
  }

  // Show loading while checking authentication
  if (authLoading || loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/logo.webp" alt="Meeting Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Çalışan Yönetimi</h1>
                <p className="text-sm text-gray-500">{user.sirket?.ad}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Yeni Çalışan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {(message || error) && (
          <div className="mb-6">
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-600">{message}</p>
                  </div>
                </div>
              </div>
            )}
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
          </div>
        )}

        {/* Add Employee Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Çalışan Ekle
            </h3>

            <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adSoyad" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  id="adSoyad"
                  name="adSoyad"
                  required
                  value={newEmployeeForm.adSoyad}
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
                  value={newEmployeeForm.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="mehmet@sirketiniz.com"
                />
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
                  value={newEmployeeForm.sifre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="En az 6 karakter"
                />
              </div>

              <div>
                <label htmlFor="departman" className="block text-sm font-medium text-gray-700 mb-2">
                  Departman
                </label>
                <select
                  id="departman"
                  name="departman"
                  value={newEmployeeForm.departman}
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
                  value={newEmployeeForm.pozisyon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="Örn: Developer"
                />
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                  <span>{saving ? 'Ekleniyor...' : 'Çalışanı Ekle'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Employees List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Çalışanlar ({employees.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <div key={employee.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {employee.adSoyad.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">{employee.adSoyad}</h4>
                      {employee.rol === 'YONETICI' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          Yönetici
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.email} • {employee.pozisyon} • {employee.departman}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    {new Date(employee.olusturmaTarihi).toLocaleDateString('tr-TR')}
                  </span>
                  {employee.rol !== 'YONETICI' && (
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Çalışanı Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}