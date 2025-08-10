import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create companies
  console.log('Creating companies...')
  const workcube = await prisma.sirket.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ad: 'WorkCube',
      aciklama: 'Toplantı yönetim sistemi geliştiren teknoloji şirketi',
      website: 'https://workcube.com',
      aktif: true
    }
  })

  const techCorp = await prisma.sirket.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      ad: 'TechCorp',
      aciklama: 'Yazılım geliştirme şirketi',
      website: 'https://techcorp.com',
      aktif: true
    }
  })

  console.log(`Companies created: ${workcube.ad}, ${techCorp.ad}`)

  // Hash password
  const hashedPassword = await bcryptjs.hash('123456', 12)

  // Create users for WorkCube
  console.log('Creating WorkCube users...')
  const ahmet = await prisma.kullanici.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      adSoyad: 'Ahmet Yılmaz',
      email: 'ahmet@workcube.com',
      sifre: hashedPassword,
      telefon: '+90 532 123 4567',
      departman: 'Yönetim',
      pozisyon: 'Şirket Yöneticisi',
      rol: 'YONETICI',
      sirketId: workcube.id,
      aktif: true,
      emailOnaylandi: true
    }
  })

  const fatma = await prisma.kullanici.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      adSoyad: 'Fatma Kaya',
      email: 'fatma@workcube.com',
      sifre: hashedPassword,
      telefon: '+90 532 234 5678',
      departman: 'IT',
      pozisyon: 'Backend Developer',
      rol: 'CALISAN',
      sirketId: workcube.id,
      aktif: true,
      emailOnaylandi: true
    }
  })

  const ayse = await prisma.kullanici.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      adSoyad: 'Ayşe Demir',
      email: 'ayse@workcube.com',
      sifre: hashedPassword,
      telefon: '+90 532 345 6789',
      departman: 'QA',
      pozisyon: 'QA Engineer',
      rol: 'CALISAN',
      sirketId: workcube.id,
      aktif: true,
      emailOnaylandi: true
    }
  })

  const mehmet = await prisma.kullanici.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      adSoyad: 'Mehmet Özkan',
      email: 'mehmet@workcube.com',
      sifre: hashedPassword,
      telefon: '+90 532 456 7890',
      departman: 'UI/UX',
      pozisyon: 'UI Designer',
      rol: 'CALISAN',
      sirketId: workcube.id,
      aktif: true,
      emailOnaylandi: true
    }
  })

  const zeynep = await prisma.kullanici.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      adSoyad: 'Zeynep Ak',
      email: 'zeynep@workcube.com',
      sifre: hashedPassword,
      telefon: '+90 532 567 8901',
      departman: 'İnsan Kaynakları',
      pozisyon: 'İK Uzmanı',
      rol: 'CALISAN',
      sirketId: workcube.id,
      aktif: true,
      emailOnaylandi: true
    }
  })

  // Create users for TechCorp
  console.log('Creating TechCorp users...')
  const ali = await prisma.kullanici.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      adSoyad: 'Ali Veli',
      email: 'ali@techcorp.com',
      sifre: hashedPassword,
      telefon: '+90 532 678 9012',
      departman: 'Yönetim',
      pozisyon: 'Şirket Yöneticisi',
      rol: 'YONETICI',
      sirketId: techCorp.id,
      aktif: true,
      emailOnaylandi: true
    }
  })

  const elif = await prisma.kullanici.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      adSoyad: 'Elif Can',
      email: 'elif@techcorp.com',
      sifre: hashedPassword,
      telefon: '+90 532 789 0123',
      departman: 'Pazarlama',
      pozisyon: 'Pazarlama Müdürü',
      rol: 'CALISAN',
      sirketId: techCorp.id,
      aktif: true,
      emailOnaylandi: true
    }
  })

  console.log('Users created for both companies')

  // Create sample meetings for WorkCube
  console.log('Creating sample meetings for WorkCube...')
  const meeting1 = await prisma.toplanti.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      baslik: 'Haftalık Sprint Değerlendirmesi',
      aciklama: 'Bu hafta tamamlanan taskların değerlendirilmesi ve gelecek hafta planlaması',
      tarih: new Date('2024-12-10T09:00:00Z'),
      saat: new Date('1970-01-01T09:00:00Z'),
      sure: 60,
      olusturanId: ahmet.id,
      sirketId: workcube.id,
      konum: 'Toplantı Salonu A',
      durum: 'aktif'
    }
  })

  const meeting2 = await prisma.toplanti.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      baslik: 'Ürün Roadmap Toplantısı',
      aciklama: '2024 Q1 ürün roadmap ve öncelik belirleme toplantısı',
      tarih: new Date('2024-12-12T14:00:00Z'),
      saat: new Date('1970-01-01T14:00:00Z'),
      sure: 120,
      olusturanId: fatma.id,
      sirketId: workcube.id,
      onlineLink: 'https://meet.google.com/abc-defg-hij',
      durum: 'aktif'
    }
  })

  // Create sample meetings for TechCorp
  console.log('Creating sample meetings for TechCorp...')
  const meeting3 = await prisma.toplanti.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      baslik: 'Proje Kickoff',
      aciklama: 'Yeni proje başlangıç toplantısı',
      tarih: new Date('2024-12-11T10:00:00Z'),
      saat: new Date('1970-01-01T10:00:00Z'),
      sure: 90,
      olusturanId: ali.id,
      sirketId: techCorp.id,
      konum: 'Büyük Toplantı Salonu',
      durum: 'aktif'
    }
  })

  // Create participants for WorkCube meetings
  console.log('Creating meeting participants...')
  await prisma.toplantiKatilimci.createMany({
    data: [
      // Meeting 1 participants
      { toplantiId: meeting1.id, kullaniciId: ahmet.id, katilimDurumu: 'katildi' },
      { toplantiId: meeting1.id, kullaniciId: fatma.id, katilimDurumu: 'katildi' },
      { toplantiId: meeting1.id, kullaniciId: ayse.id, katilimDurumu: 'katildi' },
      { toplantiId: meeting1.id, kullaniciId: mehmet.id, katilimDurumu: 'beklemede' },
      
      // Meeting 2 participants  
      { toplantiId: meeting2.id, kullaniciId: fatma.id, katilimDurumu: 'katildi' },
      { toplantiId: meeting2.id, kullaniciId: ahmet.id, katilimDurumu: 'katildi' },
      { toplantiId: meeting2.id, kullaniciId: zeynep.id, katilimDurumu: 'katilmadi' },
      
      // Meeting 3 participants (TechCorp)
      { toplantiId: meeting3.id, kullaniciId: ali.id, katilimDurumu: 'katildi' },
      { toplantiId: meeting3.id, kullaniciId: elif.id, katilimDurumu: 'beklemede' }
    ],
    skipDuplicates: true
  })

  // Create sample actions for WorkCube meetings
  console.log('Creating sample actions...')
  const action1 = await prisma.toplantiAksiyon.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      baslik: 'API Documentation Update',
      aciklama: 'API dokümantasyonunu güncellemek ve eksik endpointleri eklemek',
      oncelik: 'yuksek',
      durum: 'devam_ediyor',
      bitisTarihi: new Date('2024-12-15T00:00:00Z'),
      toplantiId: meeting1.id
    }
  })

  const action2 = await prisma.toplantiAksiyon.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      baslik: 'User Testing Setup',
      aciklama: 'Kullanıcı test ortamını kurmak ve test senaryolarını hazırlamak',
      oncelik: 'orta',
      durum: 'tamamlandi',
      bitisTarihi: new Date('2024-12-18T00:00:00Z'),
      toplantiId: meeting2.id
    }
  })

  // Create action responsible people
  console.log('Creating action responsible people...')
  await prisma.aksiyonSorumluKisi.createMany({
    data: [
      // Action 1 responsible people
      { aksiyonId: action1.id, kullaniciId: fatma.id, rol: 'Ana Sorumlu' },
      { aksiyonId: action1.id, kullaniciId: mehmet.id, rol: 'Yardımcı' },
      
      // Action 2 responsible people
      { aksiyonId: action2.id, kullaniciId: ayse.id, rol: 'Ana Sorumlu' },
      { aksiyonId: action2.id, kullaniciId: zeynep.id, rol: 'Koordinatör' }
    ],
    skipDuplicates: true
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('\nCreated:')
  console.log('- 2 companies (WorkCube, TechCorp)')
  console.log('- 7 users (5 WorkCube, 2 TechCorp) with roles')
  console.log('- 3 meetings (2 WorkCube, 1 TechCorp)')
  console.log('- 9 meeting participants')
  console.log('- 2 actions with 4 responsible people')
  console.log('\nDefault login credentials:')
  console.log('👤 YÖNETİCİLER:')
  console.log('Email: ahmet@workcube.com | Password: 123456 (WorkCube Yöneticisi)')
  console.log('Email: ali@techcorp.com | Password: 123456 (TechCorp Yöneticisi)')
  console.log('👥 ÇALIŞANLAR:')
  console.log('Email: fatma@workcube.com | Password: 123456 (WorkCube Çalışanı)')
  console.log('Email: ayse@workcube.com | Password: 123456 (WorkCube Çalışanı)')
  console.log('Email: elif@techcorp.com | Password: 123456 (TechCorp Çalışanı)')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })