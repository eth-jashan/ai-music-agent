import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow access to auth pages without token
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Redirect to login if no token
    if (!token && pathname !== '/') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Redirect to onboarding if user hasn't completed setup
    if (token && pathname === '/') {
      if (!token.hasSpotifyConnection && !token.hasSoundCloudConnection) {
        return NextResponse.redirect(new URL('/auth/onboarding', req.url))
      }
      if (!token.hasMusicProfile) {
        return NextResponse.redirect(new URL('/auth/onboarding', req.url))
      }
      return NextResponse.redirect(new URL('/chat', req.url))
    }

    // Allow authenticated users to access protected routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to API routes and auth pages
        if (req.nextUrl.pathname.startsWith('/api/') ||
            req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }

        // Require token for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}