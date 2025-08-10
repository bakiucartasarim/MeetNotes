import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

interface RouteParams {
  params: { id: string }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const meetingId = parseInt(params.id)
    const body = await request.json()
    const { kullaniciId } = body

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

    // Kullanıcıyı kontrol et
    const currentUser = await prisma.kullanici.findUnique({
      where: { id: decodedToken.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Toplantıyı kontrol et
    const meeting = await prisma.toplanti.findUnique({
      where: { id: meetingId },
      include: {
        olusturan: true
      }
    })

    if (!meeting) {
      return NextResponse.json({ success: false, error: 'Toplantı bulunamadı' }, { status: 404 })
    }

    // Aynı şirketten mi ve yetki kontrolü (sadece toplantı sahibi veya yönetici ekleyebilir)
    if (meeting.sirketId !== currentUser.sirketId) {
      return NextResponse.json({ success: false, error: 'Bu toplantıya erişim yetkiniz yok' }, { status: 403 })
    }

    if (meeting.olusturanId !== currentUser.id && currentUser.rol !== 'YONETICI') {
      return NextResponse.json({ success: false, error: 'Bu toplantıya katılımcı eklemek için yetkiniz yok' }, { status: 403 })
    }

    // Eklenecek kullanıcıyı kontrol et
    const userToAdd = await prisma.kullanici.findUnique({
      where: { id: kullaniciId }
    })

    if (!userToAdd) {
      return NextResponse.json({ success: false, error: 'Eklenecek kullanıcı bulunamadı' }, { status: 404 })
    }

    if (userToAdd.sirketId !== currentUser.sirketId) {
      return NextResponse.json({ success: false, error: 'Sadece aynı şirketten kullanıcılar eklenebilir' }, { status: 400 })
    }

    // Zaten katılımcı mı kontrol et
    const existingParticipant = await prisma.toplantiKatilimci.findFirst({
      where: {
        toplantiId: meetingId,
        kullaniciId: kullaniciId
      }
    })

    if (existingParticipant) {
      return NextResponse.json({ success: false, error: 'Bu kullanıcı zaten toplantıya katılıyor' }, { status: 400 })
    }

    // Katılımcı ekle
    const participant = await prisma.toplantiKatilimci.create({
      data: {
        toplantiId: meetingId,
        kullaniciId: kullaniciId,
        katilimDurumu: 'beklemede'
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
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Katılımcı başarıyla eklendi',
      participant
    })

  } catch (error) {
    console.error('Add participant error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Katılımcı eklenirken hata oluştu' 
    }, { status: 500 })
  }
}