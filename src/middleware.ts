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
    // Get token from cookie or header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // Redirect to login page if no token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verify JWT token
      jwt.verify(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      console.error('JWT Verification failed:', error)
      // Redirect to login if token is invalid
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/meetings/:path*']
}