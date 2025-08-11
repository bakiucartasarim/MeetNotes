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

    // Sadece yöneticiler ve toplantı sahipleri onayları görebilir
    if (currentUser.rol !== 'YONETICI') {
      // Toplantı sahibi olan toplantıları kontrol et
      const ownedMeetings = await prisma.toplanti.findMany({
        where: { 
          olusturanId: currentUser.id,
          sirketId: currentUser.sirketId 
        },
        select: { id: true }
      })
      
      if (ownedMeetings.length === 0) {
        return NextResponse.json({ success: true, data: { extensionRequests: [], actionApprovals: [] } })
      }
    }

    // Bekleyen ek süre taleplerini getir
    const extensionRequests = await prisma.aksiyonEkSureTalebi.findMany({
      where: {
        durum: 'beklemede',
        aksiyonSorumluKisi: {
          aksiyon: {
            toplanti: {
              sirketId: currentUser.sirketId,
              OR: currentUser.rol === 'YONETICI' ? undefined : [
                { olusturanId: currentUser.id }
              ]
            }
          }
        }
      },
      include: {
        talepEden: {
          select: {
            id: true,
            adSoyad: true,
            email: true,
            departman: true,
            pozisyon: true
          }
        },
        aksiyonSorumluKisi: {
          include: {
            aksiyon: {
              include: {
                toplanti: {
                  select: {
                    id: true,
                    baslik: true,
                    tarih: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { talepTarihi: 'asc' }
    })

    // Bekleyen aksiyon onaylarını getir (tamamlandı olarak işaretlenen ama henüz yönetici tarafından onaylanmayan)
    const actionApprovals = await prisma.aksiyonSorumluKisi.findMany({
      where: {
        durum: 'tamamlandi',
        onaylandi: false,
        aksiyon: {
          toplanti: {
            sirketId: currentUser.sirketId,
            OR: currentUser.rol === 'YONETICI' ? undefined : [
              { olusturanId: currentUser.id }
            ]
          }
        }
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
          include: {
            toplanti: {
              select: {
                id: true,
                baslik: true,
                tarih: true
              }
            }
          }
        }
      },
      orderBy: { onayTarihi: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        extensionRequests: extensionRequests.map(req => ({
          id: req.id,
          yeniTarih: req.yeniTarih.toISOString().split('T')[0],
          talepYorumu: req.talepYorumu,
          talepTarihi: req.talepTarihi.toISOString(),
          talepEden: req.talepEden,
          aksiyon: {
            id: req.aksiyonSorumluKisi.aksiyon.id,
            baslik: req.aksiyonSorumluKisi.aksiyon.baslik,
            mevcutBitisTarihi: req.aksiyonSorumluKisi.bitisTarihi?.toISOString().split('T')[0] || null,
            toplanti: req.aksiyonSorumluKisi.aksiyon.toplanti
          }
        })),
        actionApprovals: actionApprovals.map(approval => ({
          id: approval.id,
          kullanici: approval.kullanici,
          durum: approval.durum,
          baslangicTarihi: approval.baslangicTarihi?.toISOString().split('T')[0] || null,
          bitisTarihi: approval.bitisTarihi?.toISOString().split('T')[0] || null,
          aksiyon: {
            id: approval.aksiyon.id,
            baslik: approval.aksiyon.baslik,
            aciklama: approval.aksiyon.aciklama,
            toplanti: approval.aksiyon.toplanti
          }
        }))
      }
    })

  } catch (error) {
    console.error('Approvals API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Onaylar getirilemedi' },
      { status: 500 }
    )
  }
}