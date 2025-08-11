import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const extensionRequestId = parseInt(resolvedParams.id)
    const body = await request.json()
    const { approved, cevapYorumu } = body

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

    // Ek süre talebi kaydını kontrol et
    const extensionRequest = await prisma.aksiyonEkSureTalebi.findUnique({
      where: { id: extensionRequestId },
      include: {
        aksiyonSorumluKisi: {
          include: {
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
        },
        talepEden: true
      }
    })

    if (!extensionRequest) {
      return NextResponse.json({ success: false, error: 'Ek süre talebi bulunamadı' }, { status: 404 })
    }

    // Kullanıcı kontrolü - sadece toplantı sahibi veya yönetici onaylayabilir
    const currentUser = await prisma.kullanici.findUnique({
      where: { id: decodedToken.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const meeting = extensionRequest.aksiyonSorumluKisi.aksiyon.toplanti
    const canApprove = meeting.olusturanId === currentUser.id || currentUser.rol === 'YONETICI'

    if (!canApprove) {
      return NextResponse.json({ success: false, error: 'Bu talebe yanıt vermek için yetkiniz yok' }, { status: 403 })
    }

    // Aynı şirketten kontrol et
    if (meeting.sirketId !== currentUser.sirketId) {
      return NextResponse.json({ success: false, error: 'Bu talebe erişim yetkiniz yok' }, { status: 403 })
    }

    // Talep durumunu güncelle
    const updatedRequest = await prisma.aksiyonEkSureTalebi.update({
      where: { id: extensionRequestId },
      data: {
        durum: approved ? 'kabul' : 'red',
        cevapYorumu: cevapYorumu,
        cevapTarihi: new Date(),
        cevapVerenId: currentUser.id
      },
      include: {
        talepEden: {
          select: {
            id: true,
            adSoyad: true,
            email: true
          }
        },
        cevapVeren: {
          select: {
            id: true,
            adSoyad: true,
            email: true
          }
        }
      }
    })

    // Eğer kabul edildiyse, sorumlu kişinin bitiş tarihini güncelle
    if (approved) {
      await prisma.aksiyonSorumluKisi.update({
        where: { id: extensionRequest.aksiyonSorumluKisiId },
        data: {
          bitisTarihi: extensionRequest.yeniTarih
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: approved ? 'Ek süre talebi kabul edildi' : 'Ek süre talebi reddedildi',
      data: updatedRequest
    })

  } catch (error) {
    console.error('Extension request approval error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Talep yanıtlanırken hata oluştu' 
    }, { status: 500 })
  }
}