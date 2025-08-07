import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  // For now, let's disable middleware and let client-side handle authentication
  // This prevents redirect loops and allows proper React routing
  return NextResponse.next()
}

export const config = {
  matcher: ['/meetings/:path*']
}