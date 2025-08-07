import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Protected routes that require authentication
const protectedRoutes = ['/meetings', '/meetings/new', '/meetings/[id]']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route.replace('[id]', ''))
  )

  if (isProtectedRoute) {
    // Check if browser environment (client-side) - skip middleware for client routing
    const userAgent = request.headers.get('user-agent') || ''
    if (userAgent.includes('Next.js')) {
      return NextResponse.next()
    }

    // Get token from cookie or header  
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    // For client-side navigation, let the page handle authentication
    // This prevents redirect loops
    if (!token && request.headers.get('accept')?.includes('text/html')) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (token) {
      try {
        // Verify JWT token
        jwt.verify(token, JWT_SECRET)
        return NextResponse.next()
      } catch (error) {
        console.error('JWT Verification failed:', error)
        // Clear invalid token
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('token')
        return response
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/meetings/:path*']
}