import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.kullanici.findMany({
      where: { aktif: true },
      select: {
        id: true,
        adSoyad: true,
        email: true,
        departman: true,
        pozisyon: true
      }
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Users API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Hash default password if not provided
    const hashedPassword = await bcryptjs.hash(data.sifre || '123456', 12)
    
    const user = await prisma.kullanici.create({
      data: {
        adSoyad: data.adSoyad,
        email: data.email,
        sifre: hashedPassword,
        telefon: data.telefon,
        departman: data.departman,
        pozisyon: data.pozisyon,
      },
      select: {
        id: true,
        adSoyad: true,
        email: true,
        departman: true,
        pozisyon: true,
        aktif: true,
        createdAt: true
      }
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Create User Error:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}