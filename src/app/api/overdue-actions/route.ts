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

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Gece yarısından itibaren

    // Geciken aksiyonları bul (bitiş tarihi bugünden önce ve henüz tamamlanmamış)
    const overdueActions = await prisma.aksiyonSorumluKisi.findMany({
      where: {
        bitisTarihi: {
          lt: today
        },
        durum: {
          not: 'tamamlandi'
        },
        aksiyon: {
          toplanti: {
            sirketId: currentUser.sirketId,
            // Yönetici değilse sadece kendi oluşturduğu toplantıları veya sorumlu olduğu aksiyonları
            ...(currentUser.rol !== 'YONETICI' && {
              OR: [
                { olusturanId: currentUser.id },
                { 
                  aksiyonlar: {
                    some: {
                      sorumluKisiler: {
                        some: { kullaniciId: currentUser.id }
                      }
                    }
                  }
                }
              ]
            })
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
              include: {
                olusturan: {
                  select: {
                    id: true,
                    adSoyad: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { bitisTarihi: 'asc' }
    })

    // Gecikme sürelerini hesapla ve formatla
    const formattedOverdueActions = overdueActions.map(action => {
      const endDate = new Date(action.bitisTarihi!)
      const diffTime = today.getTime() - endDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return {
        id: action.id,
        kullanici: action.kullanici,
        durum: action.durum,
        rol: action.rol,
        baslangicTarihi: action.baslangicTarihi?.toISOString().split('T')[0] || null,
        bitisTarihi: action.bitisTarihi?.toISOString().split('T')[0] || null,
        gecikmeGunu: diffDays,
        aksiyon: {
          id: action.aksiyon.id,
          baslik: action.aksiyon.baslik,
          aciklama: action.aksiyon.aciklama,
          oncelik: action.aksiyon.oncelik,
          toplanti: {
            id: action.aksiyon.toplanti.id,
            baslik: action.aksiyon.toplanti.baslik,
            tarih: action.aksiyon.toplanti.tarih.toISOString().split('T')[0],
            olusturan: action.aksiyon.toplanti.olusturan
          }
        }
      }
    })

    // Öncelik ve gecikme süresine göre sırala
    const sortedActions = formattedOverdueActions.sort((a, b) => {
      // Önce öncelik sıralaması (kritik > yüksek > orta > düşük)
      const priorityOrder = { kritik: 4, yuksek: 3, orta: 2, dusuk: 1 }
      const priorityDiff = priorityOrder[b.aksiyon.oncelik as keyof typeof priorityOrder] - 
                          priorityOrder[a.aksiyon.oncelik as keyof typeof priorityOrder]
      
      // Öncelik aynıysa gecikme süresine göre sırala
      return priorityDiff !== 0 ? priorityDiff : b.gecikmeGunu - a.gecikmeGunu
    })

    return NextResponse.json({
      success: true,
      data: {
        overdueActions: sortedActions,
        totalCount: sortedActions.length,
        criticalCount: sortedActions.filter(a => a.aksiyon.oncelik === 'kritik').length,
        highPriorityCount: sortedActions.filter(a => a.aksiyon.oncelik === 'yuksek').length
      }
    })

  } catch (error) {
    console.error('Overdue Actions API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Geciken aksiyonlar getirilemedi' },
      { status: 500 }
    )
  }
}