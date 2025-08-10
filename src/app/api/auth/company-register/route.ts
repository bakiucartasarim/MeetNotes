import { NextRequest, NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { 
      sirketAdi, 
      sirketAciklamasi, 
      website,
      yoneticiAdi,
      yoneticiEmail,
      yoneticiTelefon,
      yoneticiSifre 
    } = await request.json()

    // Validation
    if (!sirketAdi || !yoneticiAdi || !yoneticiEmail || !yoneticiSifre) {
      return NextResponse.json({
        success: false,
        error: 'Şirket adı, yönetici bilgileri ve şifre gereklidir'
      }, { status: 400 })
    }

    if (yoneticiSifre.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır'
      }, { status: 400 })
    }

    // Check if company already exists
    const existingCompany = await prisma.sirket.findFirst({
      where: { ad: sirketAdi }
    })

    if (existingCompany) {
      return NextResponse.json({
        success: false,
        error: 'Bu isimde bir şirket zaten kayıtlı'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.kullanici.findUnique({
      where: { email: yoneticiEmail }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Bu e-posta adresi ile zaten kayıt var'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(yoneticiSifre, 12)

    // Create company and admin user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.sirket.create({
        data: {
          ad: sirketAdi,
          aciklama: sirketAciklamasi || null,
          website: website || null,
          aktif: true
        }
      })

      // Create admin user
      const admin = await tx.kullanici.create({
        data: {
          adSoyad: yoneticiAdi,
          email: yoneticiEmail,
          sifre: hashedPassword,
          telefon: yoneticiTelefon || null,
          departman: 'Yönetim',
          pozisyon: 'Şirket Yöneticisi',
          rol: 'YONETICI',
          sirketId: company.id,
          aktif: true,
          emailOnaylandi: true
        }
      })

      return { company, admin }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.admin.id, 
        email: result.admin.email,
        rol: result.admin.rol,
        sirketId: result.company.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Prepare user object for client
    const user = {
      id: result.admin.id,
      adSoyad: result.admin.adSoyad,
      email: result.admin.email,
      telefon: result.admin.telefon,
      departman: result.admin.departman,
      pozisyon: result.admin.pozisyon,
      rol: result.admin.rol,
      sirketId: result.admin.sirketId,
      sirket: {
        id: result.company.id,
        ad: result.company.ad,
        aciklama: result.company.aciklama,
        website: result.company.website
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Şirket ve yönetici hesabı başarıyla oluşturuldu',
      token,
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Company registration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası oluştu'
    }, { status: 500 })
  }
}