import { NextResponse } from 'next/server'

// Demo data
const demoUsers = [
  {
    id: 1,
    adSoyad: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@workcube.com',
    departman: 'IT',
    pozisyon: 'Yazılım Geliştirici'
  },
  {
    id: 2,
    adSoyad: 'Fatma Kaya',
    email: 'fatma.kaya@workcube.com',
    departman: 'İK',
    pozisyon: 'İK Uzmanı'
  },
  {
    id: 3,
    adSoyad: 'Mehmet Öz',
    email: 'mehmet.oz@workcube.com',
    departman: 'Satış',
    pozisyon: 'Satış Temsilcisi'
  },
  {
    id: 4,
    adSoyad: 'Ayşe Demir',
    email: 'ayse.demir@workcube.com',
    departman: 'Pazarlama',
    pozisyon: 'Pazarlama Uzmanı'
  }
]

export async function GET() {
  return NextResponse.json({ success: true, data: demoUsers })
}