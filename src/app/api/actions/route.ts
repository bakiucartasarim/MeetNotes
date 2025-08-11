import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('meeting_id')
    
    if (!meetingId) {
      return NextResponse.json(
        { success: false, error: 'meeting_id gerekli' },
        { status: 400 }
      )
    }

    const actions = await prisma.toplantiAksiyon.findMany({
      where: { toplantiId: parseInt(meetingId) },
      include: {
        sorumluKisiler: {
          include: {
            kullanici: {
              select: { id: true, adSoyad: true, email: true }
            }
          }
        }
      },
      orderBy: { olusturmaTarihi: 'asc' }
    })

    return NextResponse.json({ success: true, data: actions })
  } catch (error) {
    console.error('Actions API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Aksiyonlar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const action = await prisma.toplantiAksiyon.create({
      data: {
        toplantiId: parseInt(data.toplantiId),
        baslik: data.baslik,
        aciklama: data.aciklama,
        durum: data.durum || 'beklemede',
        baslangicTarihi: data.baslangicTarihi ? new Date(data.baslangicTarihi) : null,
        bitisTarihi: data.bitisTarihi ? new Date(data.bitisTarihi) : null,
        oncelik: data.oncelik || 'orta'
      }
    })

    // Sorumlu kişileri ekle
    if (data.sorumluKisiler && data.sorumluKisiler.length > 0) {
      await prisma.aksiyonSorumluKisi.createMany({
        data: data.sorumluKisiler.map((sorumlu: {
          kullaniciId: string, 
          rol?: string,
          baslangicTarihi?: string,
          bitisTarihi?: string,
          durum?: string
        }) => ({
          aksiyonId: action.id,
          kullaniciId: parseInt(sorumlu.kullaniciId),
          rol: sorumlu.rol || 'Sorumlu',
          baslangicTarihi: sorumlu.baslangicTarihi ? new Date(sorumlu.baslangicTarihi) : null,
          bitisTarihi: sorumlu.bitisTarihi ? new Date(sorumlu.bitisTarihi) : null,
          durum: sorumlu.durum || 'beklemede'
        }))
      })
    }

    const actionWithResponsibles = await prisma.toplantiAksiyon.findUnique({
      where: { id: action.id },
      include: {
        sorumluKisiler: {
          include: {
            kullanici: {
              select: { id: true, adSoyad: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: actionWithResponsibles })
  } catch (error) {
    console.error('Create Action Error:', error)
    return NextResponse.json(
      { success: false, error: 'Aksiyon oluşturulamadı' },
      { status: 500 }
    )
  }
}