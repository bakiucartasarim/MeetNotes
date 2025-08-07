import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { email, sifre } = await request.json()
    
    if (!email || !sifre) {
      return NextResponse.json(
        { success: false, error: 'E-posta ve şifre gerekli' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.kullanici.findUnique({
      where: { email },
      select: {
        id: true,
        adSoyad: true,
        email: true,
        sifre: true,
        departman: true,
        pozisyon: true,
        aktif: true,
        emailOnaylandi: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      )
    }

    if (!user.aktif) {
      return NextResponse.json(
        { success: false, error: 'Hesabınız deaktif durumda' },
        { status: 401 }
      )
    }

    // Compare password
    const isPasswordValid = await bcryptjs.compare(sifre, user.sifre)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Hatalı şifre' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.kullanici.update({
      where: { id: user.id },
      data: { sonGirisTarihi: new Date() }
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        adSoyad: user.adSoyad
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user data without password
    const userData = {
      id: user.id,
      adSoyad: user.adSoyad,
      email: user.email,
      departman: user.departman,
      pozisyon: user.pozisyon,
      emailOnaylandi: user.emailOnaylandi
    }

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      message: 'Giriş başarılı'
    })

  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}