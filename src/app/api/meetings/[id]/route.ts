import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const kullaniciId = searchParams.get('kullanici_id')
    const resolvedParams = await params
    const meetingId = parseInt(resolvedParams.id)
    
    if (!kullaniciId) {
      return NextResponse.json(
        { success: false, error: 'kullanici_id gerekli' },
        { status: 400 }
      )
    }

    if (isNaN(meetingId)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz toplantı ID' },
        { status: 400 }
      )
    }

    const meeting = await prisma.toplanti.findFirst({
      where: {
        id: meetingId,
        OR: [
          // 1. Toplantıyı oluşturan
          { olusturanId: parseInt(kullaniciId) },
          // 2. Toplantıya katılımcı olarak davet edilen
          { 
            katilimcilar: {
              some: { kullaniciId: parseInt(kullaniciId) }
            }
          },
          // 3. Toplantının herhangi bir aksiyonunda sorumlu kişi olan
          {
            aksiyonlar: {
              some: {
                sorumluKisiler: {
                  some: { kullaniciId: parseInt(kullaniciId) }
                }
              }
            }
          }
        ]
      },
      include: {
        olusturan: {
          select: { 
            id: true, 
            adSoyad: true, 
            email: true, 
            departman: true, 
            pozisyon: true 
          }
        },
        katilimcilar: {
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
        },
        aksiyonlar: {
          include: {
            sorumluKisiler: {
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
            }
          },
          orderBy: { olusturmaTarihi: 'desc' }
        }
      }
    })

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: 'Toplantı bulunamadı veya erişim yetkiniz yok' },
        { status: 403 }
      )
    }

    // Format the response data
    const formattedMeeting = {
      ...meeting,
      tarih: meeting.tarih.toISOString().split('T')[0], // YYYY-MM-DD format
      saat: meeting.saat.toTimeString().slice(0, 5), // HH:MM format
      aksiyonlar: meeting.aksiyonlar.map(action => ({
        ...action,
        baslangicTarihi: action.baslangicTarihi?.toISOString().split('T')[0] || null,
        bitisTarihi: action.bitisTarihi?.toISOString().split('T')[0] || null,
        sorumluKisiler: action.sorumluKisiler.map(responsible => ({
          ...responsible,
          onayTarihi: responsible.onayTarihi?.toISOString() || null
        }))
      }))
    }

    return NextResponse.json({ success: true, data: formattedMeeting })
  } catch (error) {
    console.error('Meeting Detail API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Toplantı detayları getirilemedi' },
      { status: 500 }
    )
  }
}