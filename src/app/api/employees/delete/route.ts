import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId } = body

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

    // Silinecek çalışanı bul
    const employeeToDelete = await prisma.kullanici.findUnique({
      where: { id: employeeId }
    })

    if (!employeeToDelete) {
      return NextResponse.json({ success: false, error: 'Çalışan bulunamadı' }, { status: 404 })
    }

    // Aynı şirketten mi kontrol et
    if (employeeToDelete.sirketId !== currentUser.sirketId) {
      return NextResponse.json({ success: false, error: 'Bu çalışanı silme yetkiniz yok' }, { status: 403 })
    }

    // Yöneticileri silmeye izin verme
    if (employeeToDelete.rol === 'YONETICI') {
      return NextResponse.json({ success: false, error: 'Yöneticiler silinemez' }, { status: 400 })
    }

    // Çalışanı sil
    await prisma.kullanici.delete({
      where: { id: employeeId }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Çalışan başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Çalışan silinirken hata oluştu' 
    }, { status: 500 })
  }
}