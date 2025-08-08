import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { adSoyad, email, sifre, departman, pozisyon, sirketId, yeniSirket } = await request.json()
    
    if (!adSoyad || !email || !sifre) {
      return NextResponse.json(
        { success: false, error: 'Ad soyad, e-posta ve şifre gerekli' },
        { status: 400 }
      )
    }

    if (!sirketId && !yeniSirket) {
      return NextResponse.json(
        { success: false, error: 'Şirket seçimi gerekli' },
        { status: 400 }
      )
    }

    if (sifre.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.kullanici.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta adresi zaten kullanımda' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(sifre, 12)

    let finalSirketId = sirketId

    // Create new company if needed
    if (!sirketId && yeniSirket) {
      const newCompany = await prisma.sirket.create({
        data: {
          ad: yeniSirket,
          aktif: true
        }
      })
      finalSirketId = newCompany.id
    }

    // Create user
    const user = await prisma.kullanici.create({
      data: {
        adSoyad,
        email,
        sifre: hashedPassword,
        departman: departman || null,
        pozisyon: pozisyon || null,
        sirketId: parseInt(finalSirketId),
        aktif: true,
        emailOnaylandi: false // In production, send email verification
      },
      select: {
        id: true,
        adSoyad: true,
        email: true,
        departman: true,
        pozisyon: true,
        sirketId: true,
        emailOnaylandi: true,
        createdAt: true
      }
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        adSoyad: user.adSoyad,
        sirketId: user.sirketId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      user,
      message: 'Kayıt başarılı! Hoş geldiniz.'
    })

  } catch (error: unknown) {
    console.error('Register API Error:', error)
    
    // Handle unique constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta adresi zaten kullanımda' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}