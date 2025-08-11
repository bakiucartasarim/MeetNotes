import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const meetingId = parseInt(resolvedParams.id)
    const body = await request.json()
    const { participantId, response } = body // response: 'kabul', 'red', 'ek_sure'

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

    // Katılımcı kaydını kontrol et
    const participant = await prisma.toplantiKatilimci.findUnique({
      where: { id: participantId },
      include: {
        toplanti: true,
        kullanici: true
      }
    })

    if (!participant) {
      return NextResponse.json({ success: false, error: 'Katılımcı bulunamadı' }, { status: 404 })
    }

    // Toplantının aynı şirketten olduğunu kontrol et
    if (participant.toplanti.sirketId !== currentUser.sirketId) {
      return NextResponse.json({ success: false, error: 'Bu toplantıya erişim yetkiniz yok' }, { status: 403 })
    }

    // Sadece kendi yanıtını verebilir veya yönetici/toplantı sahibi başkasının yanıtını değiştirebilir
    const canModify = participant.kullaniciId === currentUser.id || 
                     currentUser.rol === 'YONETICI' || 
                     participant.toplanti.olusturanId === currentUser.id

    if (!canModify) {
      return NextResponse.json({ success: false, error: 'Bu yanıtı değiştirme yetkiniz yok' }, { status: 403 })
    }

    // Yanıt durumunu güncelle
    let newStatus = response
    if (response === 'ek_sure') {
      newStatus = 'beklemede' // Ek süre istendiğinde tekrar beklemede yap
    }

    const updatedParticipant = await prisma.toplantiKatilimci.update({
      where: { id: participantId },
      data: {
        katilimDurumu: newStatus,
        cevapTarihi: new Date(),
        notlar: response === 'ek_sure' ? 'Ek süre talep edildi' : null
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
      message: 'Yanıt başarıyla kaydedildi',
      participant: updatedParticipant
    })

  } catch (error) {
    console.error('Participant response error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Yanıt kaydedilirken hata oluştu' 
    }, { status: 500 })
  }
}