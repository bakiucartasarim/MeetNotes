import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { actionId, responsibleId, approved, comment } = await request.json()
    
    if (!actionId || !responsibleId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'actionId, responsibleId ve approved gerekli' },
        { status: 400 }
      )
    }

    // Update the responsible person's approval status
    const updatedResponsible = await prisma.aksiyonSorumluKisi.update({
      where: { id: parseInt(responsibleId) },
      data: {
        onaylandi: approved,
        onayTarihi: approved ? new Date() : null,
        yorum: comment || null
      }
    })

    if (approved) {
      // Check if all responsible persons have approved
      const allResponsibles = await prisma.aksiyonSorumluKisi.findMany({
        where: { aksiyonId: parseInt(actionId) }
      })

      const allApproved = allResponsibles.every(r => r.onaylandi)
      
      if (allApproved) {
        // Update action status to completed
        await prisma.toplantiAksiyon.update({
          where: { id: parseInt(actionId) },
          data: { durum: 'tamamlandi' }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'Onay başarıyla kaydedildi' : 'Red işlemi kaydedildi',
      data: updatedResponsible
    })
  } catch (error) {
    console.error('Approve Action Error:', error)
    return NextResponse.json(
      { success: false, error: 'Onay işlemi gerçekleştirilemedi' },
      { status: 500 }
    )
  }
}