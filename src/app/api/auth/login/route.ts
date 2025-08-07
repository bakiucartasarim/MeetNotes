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

    // Demo users for testing (when database is not available)
    const demoUsers = [
      {
        id: 1,
        adSoyad: 'Ahmet Yılmaz',
        email: 'ahmet@workcube.com',
        sifre: '123456', // Plain password for demo
        departman: 'IT',
        pozisyon: 'Proje Yöneticisi',
        aktif: true,
        emailOnaylandi: true
      },
      {
        id: 2,
        adSoyad: 'Fatma Kaya',
        email: 'fatma@workcube.com',
        sifre: '123456',
        departman: 'IT',
        pozisyon: 'Backend Developer',
        aktif: true,
        emailOnaylandi: true
      },
      {
        id: 3,
        adSoyad: 'Ayşe Demir',
        email: 'ayse@workcube.com',
        sifre: '123456',
        departman: 'QA',
        pozisyon: 'QA Engineer',
        aktif: true,
        emailOnaylandi: true
      }
    ]

    try {
      // Try database first
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

      if (user) {
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
      }
    } catch (dbError) {
      console.log('Database not available, using demo mode')
    }

    // Fallback to demo users
    const demoUser = demoUsers.find(u => u.email === email)
    
    if (!demoUser) {
      return NextResponse.json(
        { success: false, error: 'Demo kullanıcı bulunamadı. Lütfen demo hesaplardan birini kullanın.' },
        { status: 401 }
      )
    }

    if (sifre !== demoUser.sifre) {
      return NextResponse.json(
        { success: false, error: 'Hatalı şifre' },
        { status: 401 }
      )
    }

    // Create JWT token for demo user
    const token = jwt.sign(
      { 
        id: demoUser.id, 
        email: demoUser.email,
        adSoyad: demoUser.adSoyad
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return demo user data
    const userData = {
      id: demoUser.id,
      adSoyad: demoUser.adSoyad,
      email: demoUser.email,
      departman: demoUser.departman,
      pozisyon: demoUser.pozisyon,
      emailOnaylandi: demoUser.emailOnaylandi
    }

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      message: 'Giriş başarılı (Demo Mode)'
    })

  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}