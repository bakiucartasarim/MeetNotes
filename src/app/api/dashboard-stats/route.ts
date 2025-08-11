import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // JWT token'dan kullanıcı bilgilerini al
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production')
    } catch {
      return NextResponse.json({ success: false, error: 'Geçersiz token' }, { status: 401 })
    }

    if (typeof decodedToken === 'string' || !decodedToken.userId) {
      return NextResponse.json({ success: false, error: 'Geçersiz token' }, { status: 401 })
    }

    // Kullanıcı bilgilerini al
    const currentUser = await prisma.kullanici.findUnique({
      where: { id: decodedToken.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Toplam çalışan sayısı
    const totalEmployees = await prisma.kullanici.count({
      where: { sirketId: currentUser.sirketId }
    })

    // Toplam aktif toplantı sayısı
    const totalMeetings = await prisma.toplanti.count({
      where: { 
        sirketId: currentUser.sirketId,
        durum: 'aktif'
      }
    })

    // Bekleyen ek süre talepleri
    const pendingExtensionRequests = await prisma.aksiyonEkSureTalebi.count({
      where: {
        durum: 'beklemede',
        aksiyonSorumluKisi: {
          aksiyon: {
            toplanti: {
              sirketId: currentUser.sirketId,
              olusturanId: currentUser.id
            }
          }
        }
      }
    })

    // Bekleyen aksiyon onayları (tamamlandi durumu)
    const pendingActionApprovals = await prisma.aksiyonSorumluKisi.count({
      where: {
        durum: 'tamamlandi',
        onayDurumu: 'beklemede',
        aksiyon: {
          toplanti: {
            sirketId: currentUser.sirketId,
            olusturanId: currentUser.id
          }
        }
      }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Geciken aksiyonlar
    const overdueActions = await prisma.aksiyonSorumluKisi.count({
      where: {
        bitisTarihi: {
          lt: today
        },
        durum: {
          not: 'tamamlandi'
        },
        aksiyon: {
          toplanti: {
            sirketId: currentUser.sirketId
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        totalMeetings,
        pendingActions: pendingExtensionRequests + pendingActionApprovals,
        overdueActions
      }
    })

  } catch (error) {
    console.error('Dashboard Stats API Error:', error)
    return NextResponse.json(
      { success: false, error: 'İstatistikler getirilemedi' },
      { status: 500 }
    )
  }
}