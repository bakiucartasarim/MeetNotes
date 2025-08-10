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

    // Kullanıcının yönetici olup olmadığını kontrol et
    const currentUser = await prisma.kullanici.findUnique({
      where: { id: decodedToken.userId },
      include: { sirket: true }
    })

    if (!currentUser || currentUser.rol !== 'YONETICI') {
      return NextResponse.json({ success: false, error: 'Bu işlem için yönetici yetkisi gerekli' }, { status: 403 })
    }

    // Aynı şirketteki tüm çalışanları getir
    const employees = await prisma.kullanici.findMany({
      where: { 
        sirketId: currentUser.sirketId,
        aktif: true
      },
      select: {
        id: true,
        adSoyad: true,
        email: true,
        departman: true,
        pozisyon: true,
        rol: true,
        olusturmaTarihi: true
      },
      orderBy: [
        { rol: 'desc' }, // YONETICI önce
        { olusturmaTarihi: 'asc' }
      ]
    })

    return NextResponse.json({ 
      success: true, 
      employees
    })

  } catch (error) {
    console.error('List employees error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Çalışanlar listelenirken hata oluştu' 
    }, { status: 500 })
  }
}