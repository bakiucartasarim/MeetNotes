import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For now, let's disable middleware and let client-side handle authentication
  // This prevents redirect loops and allows proper React routing
  return NextResponse.next()
}

export const config = {
  matcher: ['/meetings/:path*']
}