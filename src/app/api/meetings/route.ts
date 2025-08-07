import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kullaniciId = searchParams.get('kullanici_id')
    
    if (!kullaniciId) {
      return NextResponse.json(
        { success: false, error: 'kullanici_id gerekli' },
        { status: 400 }
      )
    }

    const meetings = await prisma.toplanti.findMany({
      where: {
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
          select: { id: true, adSoyad: true, email: true }
        },
        katilimcilar: {
          include: {
            kullanici: {
              select: { id: true, adSoyad: true, email: true }
            }
          }
        },
        aksiyonlar: {
          include: {
            sorumluKisiler: {
              include: {
                kullanici: {
                  select: { id: true, adSoyad: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { tarih: 'desc' }
    })

    return NextResponse.json({ success: true, data: meetings })
  } catch (error) {
    console.error('Meetings API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Toplantılar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const meeting = await prisma.toplanti.create({
      data: {
        baslik: data.baslik,
        aciklama: data.aciklama,
        tarih: new Date(data.tarih),
        saat: new Date(`1970-01-01T${data.saat}`),
        sure: parseInt(data.sure) || 60,
        olusturanId: parseInt(data.olusturanId),
        konum: data.konum,
        onlineLink: data.onlineLink,
        durum: data.durum || 'aktif'
      },
      include: {
        olusturan: {
          select: { id: true, adSoyad: true, email: true }
        }
      }
    })

    // Katılımcıları ekle
    if (data.katilimcilar && data.katilimcilar.length > 0) {
      await prisma.toplantiKatilimci.createMany({
        data: data.katilimcilar.map((katilimciId: number) => ({
          toplantiId: meeting.id,
          kullaniciId: katilimciId,
          katilimDurumu: 'beklemede'
        }))
      })
    }

    return NextResponse.json({ success: true, data: meeting })
  } catch (error) {
    console.error('Create Meeting Error:', error)
    return NextResponse.json(
      { success: false, error: 'Toplantı oluşturulamadı' },
      { status: 500 }
    )
  }
}