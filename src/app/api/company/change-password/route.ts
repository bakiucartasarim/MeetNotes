import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

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

    // Kullanıcıyı bul
    const currentUser = await prisma.kullanici.findUnique({
      where: { id: decodedToken.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, currentUser.sifre)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ success: false, error: 'Mevcut şifre yanlış' }, { status: 400 })
    }

    // Yeni şifre validasyonu
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Yeni şifre en az 6 karakter olmalıdır' }, { status: 400 })
    }

    // Yeni şifreyi hashle
    const hashedNewPassword = await bcryptjs.hash(newPassword, 10)

    // Şifreyi güncelle
    await prisma.kullanici.update({
      where: { id: currentUser.id },
      data: {
        sifre: hashedNewPassword
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Şifre başarıyla değiştirildi'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Şifre değiştirilirken hata oluştu' 
    }, { status: 500 })
  }
}