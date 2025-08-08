import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'

export async function POST() {
  try {
    // Check if data already exists
    const existingUsers = await prisma.kullanici.findMany()
    const existingMeetings = await prisma.toplanti.findMany()

    if (existingUsers.length > 0 || existingMeetings.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Demo data already exists. Delete existing data first.',
        existingUsersCount: existingUsers.length,
        existingMeetingsCount: existingMeetings.length
      })
    }

    // Create demo company first
    const company = await prisma.sirket.create({
      data: {
        ad: 'WorkCube Demo',
        aciklama: 'Demo şirketi - toplantı yönetim sistemi',
        website: 'https://demo.workcube.com',
        aktif: true
      }
    })

    // 1. Create demo users with hashed passwords
    const users = await prisma.$transaction(async (tx) => {
      const createdUsers = []
      
      const userData = [
        { adSoyad: 'Ahmet Yılmaz', email: 'ahmet@workcube.com', departman: 'IT', pozisyon: 'Proje Yöneticisi' },
        { adSoyad: 'Fatma Kaya', email: 'fatma@workcube.com', departman: 'IT', pozisyon: 'Backend Developer' },
        { adSoyad: 'Ayşe Demir', email: 'ayse@workcube.com', departman: 'QA', pozisyon: 'QA Engineer' },
        { adSoyad: 'Mehmet Öz', email: 'mehmet@workcube.com', departman: 'IT', pozisyon: 'Frontend Developer' }
      ]

      for (const user of userData) {
        const hashedPassword = await bcryptjs.hash('123456', 12)
        const createdUser = await tx.kullanici.create({
          data: {
            ...user,
            sifre: hashedPassword,
            sirketId: company.id,
            aktif: true,
            emailOnaylandi: true
          }
        })
        createdUsers.push(createdUser)
      }

      return createdUsers
    })

    // 2. Create demo meetings
    const meetings = await prisma.$transaction(async (tx) => {
      const createdMeetings = []

      // Meeting 1: Ahmet's project meeting (Fatma participant)
      const meeting1 = await tx.toplanti.create({
        data: {
          baslik: 'Ahmet\'nin Haftalık Proje Toplantısı',
          aciklama: 'Sprint sonucu ve gelecek hafta planlaması. Bu toplantıda tamamlanan taskları değerlendirip, gelecek sprint için planlama yapacağız.',
          tarih: new Date('2025-08-10'),
          saat: new Date('1970-01-01T14:00:00'),
          sure: 90,
          olusturanId: users[0].id, // Ahmet
          sirketId: company.id,
          konum: 'Toplantı Salonu A',
          onlineLink: 'https://meet.google.com/abc-def-ghi',
          durum: 'aktif'
        }
      })
      createdMeetings.push(meeting1)

      // Add Fatma as participant
      await tx.toplantiKatilimci.create({
        data: {
          toplantiId: meeting1.id,
          kullaniciId: users[1].id, // Fatma
          katilimDurumu: 'kabul'
        }
      })

      // Meeting 2: Customer feedback (Ayşe creator, Ahmet participant)
      const meeting2 = await tx.toplanti.create({
        data: {
          baslik: 'Müşteri Geri Bildirim Toplantısı',
          aciklama: 'Q4 müşteri memnuniyet anketleri değerlendirmesi',
          tarih: new Date('2025-08-12'),
          saat: new Date('1970-01-01T10:30:00'),
          sure: 60,
          olusturanId: users[2].id, // Ayşe
          sirketId: company.id,
          onlineLink: 'https://meet.google.com/xyz-uvw-rst',
          durum: 'aktif'
        }
      })
      createdMeetings.push(meeting2)

      // Add Ahmet as participant
      await tx.toplantiKatilimci.create({
        data: {
          toplantiId: meeting2.id,
          kullaniciId: users[0].id, // Ahmet
          katilimDurumu: 'kabul'
        }
      })

      // Meeting 3: Technical meeting (Ahmet creator, Fatma participant)
      const meeting3 = await tx.toplanti.create({
        data: {
          baslik: 'Fatma\'nın Katıldığı Toplantı',
          aciklama: 'Teknik altyapı değerlendirmesi',
          tarih: new Date('2025-08-15'),
          saat: new Date('1970-01-01T09:00:00'),
          sure: 60,
          olusturanId: users[0].id, // Ahmet
          sirketId: company.id,
          konum: 'Toplantı Salonu B',
          durum: 'aktif'
        }
      })
      createdMeetings.push(meeting3)

      // Add Fatma as participant
      await tx.toplantiKatilimci.create({
        data: {
          toplantiId: meeting3.id,
          kullaniciId: users[1].id, // Fatma
          katilimDurumu: 'beklemede'
        }
      })

      // Meeting 4: QA meeting (Ahmet creator, Ayşe action responsible)
      const meeting4 = await tx.toplanti.create({
        data: {
          baslik: 'Ayşe\'nin QA Sorumluluğu Toplantısı',
          aciklama: 'Kalite süreçleri değerlendirmesi',
          tarih: new Date('2025-08-20'),
          saat: new Date('1970-01-01T15:00:00'),
          sure: 45,
          olusturanId: users[0].id, // Ahmet
          sirketId: company.id,
          onlineLink: 'https://zoom.us/j/123456789',
          durum: 'aktif'
        }
      })
      createdMeetings.push(meeting4)

      return createdMeetings
    })

    // 3. Create demo actions
    await prisma.$transaction(async (tx) => {
      // Action for Meeting 1
      const action1 = await tx.toplantiAksiyon.create({
        data: {
          toplantiId: meetings[0].id,
          baslik: 'API Dokümantasyonu Güncellemesi',
          aciklama: 'Yeni endpoint\'lerin dokümantasyonunu hazırla',
          durum: 'devam_ediyor',
          baslangicTarihi: new Date('2025-08-08'),
          bitisTarihi: new Date('2025-08-15'),
          oncelik: 'yuksek'
        }
      })

      // Fatma responsible for action1
      await tx.aksiyonSorumluKisi.create({
        data: {
          aksiyonId: action1.id,
          kullaniciId: users[1].id, // Fatma
          rol: 'Backend Developer',
          onaylandi: true,
          onayTarihi: new Date('2025-08-08T09:30:00'),
          yorum: 'API dokümantasyonu hazır!'
        }
      })

      // Action for Meeting 2
      const action2 = await tx.toplantiAksiyon.create({
        data: {
          toplantiId: meetings[1].id,
          baslik: 'Anket Sonuçlarının Analizi',
          aciklama: 'Q4 müşteri anket verilerini analiz et',
          durum: 'tamamlandi',
          baslangicTarihi: new Date('2025-08-05'),
          bitisTarihi: new Date('2025-08-10'),
          oncelik: 'orta'
        }
      })

      // Ahmet responsible for action2
      await tx.aksiyonSorumluKisi.create({
        data: {
          aksiyonId: action2.id,
          kullaniciId: users[0].id, // Ahmet
          rol: 'Proje Yöneticisi',
          onaylandi: true,
          onayTarihi: new Date('2025-08-10T14:00:00'),
          yorum: 'Analiz tamamlandı, rapor hazır.'
        }
      })

      // Action for Meeting 3
      const action3 = await tx.toplantiAksiyon.create({
        data: {
          toplantiId: meetings[2].id,
          baslik: 'Sunucu Performans Analizi',
          aciklama: 'Mevcut sunucu kaynaklarını değerlendir',
          durum: 'beklemede',
          baslangicTarihi: new Date('2025-08-16'),
          bitisTarihi: new Date('2025-08-20'),
          oncelik: 'yuksek'
        }
      })

      // Fatma responsible for action3
      await tx.aksiyonSorumluKisi.create({
        data: {
          aksiyonId: action3.id,
          kullaniciId: users[1].id, // Fatma
          rol: 'Backend Developer'
        }
      })

      // Action for Meeting 4
      const action4 = await tx.toplantiAksiyon.create({
        data: {
          toplantiId: meetings[3].id,
          baslik: 'QA Testleri Hazırlama',
          aciklama: 'Yeni özellikler için test senaryoları',
          durum: 'beklemede',
          baslangicTarihi: new Date('2025-08-21'),
          bitisTarihi: new Date('2025-08-25'),
          oncelik: 'yuksek'
        }
      })

      // Ayşe responsible for action4
      await tx.aksiyonSorumluKisi.create({
        data: {
          aksiyonId: action4.id,
          kullaniciId: users[2].id, // Ayşe
          rol: 'QA Engineer'
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully created complete demo dataset',
      data: {
        users: users.length,
        meetings: meetings.length,
        actions: 4
      }
    })

  } catch (error: unknown) {
    console.error('Seed API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database seeding failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}