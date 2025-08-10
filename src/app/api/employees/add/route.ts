import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adSoyad, email, sifre, departman, pozisyon } = body

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

    // Aynı email adresinde kullanıcı var mı kontrol et
    const existingUser = await prisma.kullanici.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Bu e-posta adresi zaten kullanılıyor' 
      }, { status: 400 })
    }

    // Şifreyi hashle
    const hashedPassword = await bcryptjs.hash(sifre, 10)

    // Yeni çalışan oluştur
    const newEmployee = await prisma.kullanici.create({
      data: {
        adSoyad,
        email,
        sifre: hashedPassword,
        departman: departman || null,
        pozisyon: pozisyon || null,
        sirketId: currentUser.sirketId, // Yöneticinin şirketine ekle
        rol: 'CALISAN',
        emailOnaylandi: true // Yönetici eklediği için onaylı sayalım
      },
      include: {
        sirket: {
          select: {
            id: true,
            ad: true
          }
        }
      }
    })

    // Şifreyi response'dan çıkar  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sifre: _password, ...employeeWithoutPassword } = newEmployee

    return NextResponse.json({ 
      success: true, 
      message: 'Çalışan başarıyla eklendi',
      employee: employeeWithoutPassword
    })

  } catch (error) {
    console.error('Add employee error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Çalışan eklenirken hata oluştu' 
    }, { status: 500 })
  }
}