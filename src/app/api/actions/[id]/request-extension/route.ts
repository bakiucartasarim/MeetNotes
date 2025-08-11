import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const responsibleId = parseInt(resolvedParams.id)
    const body = await request.json()
    const { yeniTarih, yorum } = body

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
            toplanti: {
              include: {
                olusturan: true
              }
            }
          }
        }
      }
    })

    if (!responsible) {
      return NextResponse.json({ success: false, error: 'Sorumlu kişi bulunamadı' }, { status: 404 })
    }

    // Kullanıcı kontrolü - sadece kendisi talep edebilir
    if (responsible.kullaniciId !== decodedToken.userId) {
      return NextResponse.json({ success: false, error: 'Sadece kendi aksiyonunuz için ek süre talep edebilirsiniz' }, { status: 403 })
    }

    // Aynı şirketten kontrol et
    const currentUser = await prisma.kullanici.findUnique({
      where: { id: decodedToken.userId }
    })

    if (!currentUser || responsible.aksiyon.toplanti.sirketId !== currentUser.sirketId) {
      return NextResponse.json({ success: false, error: 'Bu aksiyona erişim yetkiniz yok' }, { status: 403 })
    }

    // Ek süre talep kaydı oluştur
    const extensionRequest = await prisma.aksiyonEkSureTalebi.create({
      data: {
        aksiyonSorumluKisiId: responsibleId,
        talepEdenId: decodedToken.userId,
        yeniTarih: new Date(yeniTarih),
        talepYorumu: yorum,
        durum: 'beklemede'
      },
      include: {
        talepEden: {
          select: {
            id: true,
            adSoyad: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Ek süre talebi başarıyla gönderildi',
      data: extensionRequest
    })

  } catch (error) {
    console.error('Request extension error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Ek süre talebi gönderilirken hata oluştu' 
    }, { status: 500 })
  }
}