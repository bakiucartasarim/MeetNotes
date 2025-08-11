import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const responsibleId = parseInt(resolvedParams.id)
    const body = await request.json()
    const { durum, baslangicTarihi, bitisTarihi, yorum } = body

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

    // Sorumlu kişi kaydını kontrol et
    const responsible = await prisma.aksiyonSorumluKisi.findUnique({
      where: { id: responsibleId },
      include: {
        kullanici: true,
        aksiyon: {
          include: {
            toplanti: true
          }
        }
      }
    })

    if (!responsible) {
      return NextResponse.json({ success: false, error: 'Sorumlu kişi bulunamadı' }, { status: 404 })
    }

    // Kullanıcı kontrolü - sadece kendisi veya yönetici değiştirebilir
    const currentUser = await prisma.kullanici.findUnique({
      where: { id: decodedToken.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const canUpdate = responsible.kullaniciId === currentUser.id || 
                     currentUser.rol === 'YONETICI' || 
                     responsible.aksiyon.toplanti.olusturanId === currentUser.id

    if (!canUpdate) {
      return NextResponse.json({ success: false, error: 'Bu aksiyonu güncelleme yetkiniz yok' }, { status: 403 })
    }

    // Aynı şirketten kontrol et
    if (responsible.aksiyon.toplanti.sirketId !== currentUser.sirketId) {
      return NextResponse.json({ success: false, error: 'Bu aksiyona erişim yetkiniz yok' }, { status: 403 })
    }

    // Sorumlu kişi bilgilerini güncelle
    const updatedResponsible = await prisma.aksiyonSorumluKisi.update({
      where: { id: responsibleId },
      data: {
        durum: durum || responsible.durum,
        baslangicTarihi: baslangicTarihi ? new Date(baslangicTarihi) : responsible.baslangicTarihi,
        bitisTarihi: bitisTarihi ? new Date(bitisTarihi) : responsible.bitisTarihi,
        yorum: yorum !== undefined ? yorum : responsible.yorum,
        onayTarihi: durum ? new Date() : responsible.onayTarihi
      },
      include: {
        kullanici: {
          select: {
            id: true,
            adSoyad: true,
            email: true,
            departman: true,
            pozisyon: true
          }
        },
        aksiyon: {
          select: {
            id: true,
            baslik: true,
            aciklama: true,
            oncelik: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Aksiyon durumu başarıyla güncellendi',
      data: updatedResponsible
    })

  } catch (error) {
    console.error('Update responsible error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Aksiyon güncellenirken hata oluştu' 
    }, { status: 500 })
  }
}