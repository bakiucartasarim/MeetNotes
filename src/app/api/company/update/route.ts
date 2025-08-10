import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sirketAdi, sirketAciklamasi, website } = body

    // JWT token'dan kullanıcı bilgilerini al
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
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

    if (!currentUser.sirket) {
      return NextResponse.json({ success: false, error: 'Şirket bilgisi bulunamadı' }, { status: 404 })
    }

    // Şirket bilgilerini güncelle
    const updatedCompany = await prisma.sirket.update({
      where: { id: currentUser.sirketId },
      data: {
        ad: sirketAdi,
        aciklama: sirketAciklamasi || null,
        website: website || null
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Şirket bilgileri başarıyla güncellendi',
      company: updatedCompany
    })

  } catch (error) {
    console.error('Update company error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Şirket bilgileri güncellenirken hata oluştu' 
    }, { status: 500 })
  }
}