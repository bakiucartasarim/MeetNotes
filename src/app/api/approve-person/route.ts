import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { aksiyonId, kullaniciId, onaylandi, yorum } = data
    
    if (!aksiyonId || !kullaniciId) {
      return NextResponse.json(
        { success: false, error: 'aksiyon_id ve kullanici_id gerekli' },
        { status: 400 }
      )
    }

    // Sorumlu kişiyi güncelle
    const updatedResponsible = await prisma.aksiyonSorumluKisi.updateMany({
      where: {
        aksiyonId: parseInt(aksiyonId),
        kullaniciId: parseInt(kullaniciId)
      },
      data: {
        onaylandi: onaylandi === true,
        onayTarihi: onaylandi === true ? new Date() : null,
        yorum: yorum || null
      }
    })

    if (updatedResponsible.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Sorumlu kişi bulunamadı' },
        { status: 404 }
      )
    }

    // Tüm sorumlu kişilerin onay durumunu kontrol et
    const allResponsibles = await prisma.aksiyonSorumluKisi.findMany({
      where: { aksiyonId: parseInt(aksiyonId) }
    })

    const allApproved = allResponsibles.every(r => r.onaylandi === true)

    // Eğer tüm sorumlu kişiler onayladıysa, aksiyonu tamamlandı olarak işaretle
    if (allApproved) {
      await prisma.toplantiAksiyon.update({
        where: { id: parseInt(aksiyonId) },
        data: { durum: 'tamamlandi' }
      })
    }

    // Güncel aksiyon bilgilerini döndür
    const action = await prisma.toplantiAksiyon.findUnique({
      where: { id: parseInt(aksiyonId) },
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

    return NextResponse.json({ 
      success: true, 
      data: action,
      message: allApproved ? 'Aksiyon tamamlandı' : 'Onay kaydedildi'
    })
  } catch (error) {
    console.error('Approve Person Error:', error)
    return NextResponse.json(
      { success: false, error: 'Onay işlemi gerçekleştirilemedi' },
      { status: 500 }
    )
  }
}