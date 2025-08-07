import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'

export async function POST() {
  try {
    // Demo users data with hashed passwords
    const demoUsers = [
      {
        adSoyad: 'Ahmet Yılmaz',
        email: 'ahmet@workcube.com',
        sifre: await bcryptjs.hash('123456', 12),
        departman: 'IT',
        pozisyon: 'Proje Yöneticisi',
        aktif: true,
        emailOnaylandi: true
      },
      {
        adSoyad: 'Fatma Kaya',
        email: 'fatma@workcube.com',
        sifre: await bcryptjs.hash('123456', 12),
        departman: 'IT',
        pozisyon: 'Backend Developer',
        aktif: true,
        emailOnaylandi: true
      },
      {
        adSoyad: 'Mehmet Öz',
        email: 'mehmet@workcube.com',
        sifre: await bcryptjs.hash('123456', 12),
        departman: 'IT',
        pozisyon: 'Frontend Developer',
        aktif: true,
        emailOnaylandi: true
      },
      {
        adSoyad: 'Ayşe Demir',
        email: 'ayse@workcube.com',
        sifre: await bcryptjs.hash('123456', 12),
        departman: 'QA',
        pozisyon: 'QA Engineer',
        aktif: true,
        emailOnaylandi: true
      },
      {
        adSoyad: 'Can Özkan',
        email: 'can@workcube.com',
        sifre: await bcryptjs.hash('123456', 12),
        departman: 'IT',
        pozisyon: 'Frontend Developer',
        aktif: true,
        emailOnaylandi: true
      },
      {
        adSoyad: 'Zeynep Aslan',
        email: 'zeynep@workcube.com',
        sifre: await bcryptjs.hash('123456', 12),
        departman: 'Muhasebe',
        pozisyon: 'Mali Müşavir',
        aktif: true,
        emailOnaylandi: true
      }
    ]

    // Check if users already exist
    const existingUsers = await prisma.kullanici.findMany({
      where: {
        email: {
          in: demoUsers.map(user => user.email)
        }
      }
    })

    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Demo users already exist',
        existingCount: existingUsers.length
      })
    }

    // Create demo users
    const createdUsers = await prisma.kullanici.createMany({
      data: demoUsers,
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdUsers.count} demo users`,
      users: demoUsers.map(user => ({
        email: user.email,
        adSoyad: user.adSoyad,
        pozisyon: user.pozisyon
      }))
    })

  } catch (error: unknown) {
    console.error('Seed API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database seeding failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}