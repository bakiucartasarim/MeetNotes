import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const companies = await prisma.sirket.findMany({
      where: {
        aktif: true
      },
      select: {
        id: true,
        ad: true,
        aciklama: true
      },
      orderBy: {
        ad: 'asc'
      }
    })

    return NextResponse.json({ success: true, data: companies })
  } catch (error) {
    console.error('Companies API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Şirketler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const company = await prisma.sirket.create({
      data: {
        ad: data.ad,
        aciklama: data.aciklama || null,
        website: data.website || null
      },
      select: {
        id: true,
        ad: true,
        aciklama: true,
        aktif: true,
        createdAt: true
      }
    })

    return NextResponse.json({ success: true, data: company })
  } catch (error) {
    console.error('Create Company Error:', error)
    return NextResponse.json(
      { success: false, error: 'Şirket oluşturulamadı' },
      { status: 500 }
    )
  }
}