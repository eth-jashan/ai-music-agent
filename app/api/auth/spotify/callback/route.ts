import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { SpotifyClient } from '@/lib/spotify/client'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/auth/login?error=unauthorized', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      console.error('Spotify OAuth error:', error)
      return NextResponse.redirect(new URL('/auth/onboarding?error=spotify_denied', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth/onboarding?error=spotify_no_code', request.url))
    }

    // Exchange code for tokens
    const tokenData = await SpotifyClient.exchangeCodeForToken(code)

    // Get user info from Spotify
    const spotifyClient = new SpotifyClient(tokenData.access_token)
    const spotifyUser = await spotifyClient.getCurrentUserProfile()

    // Find the user in our database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?error=user_not_found', request.url))
    }

    // Save or update the Spotify connection
    await db.connection.upsert({
      where: {
        userId_service: {
          userId: user.id,
          service: 'spotify',
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        serviceUserId: spotifyUser.id,
      },
      create: {
        userId: user.id,
        service: 'spotify',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        serviceUserId: spotifyUser.id,
      },
    })

    // Redirect back to onboarding with success
    return NextResponse.redirect(new URL('/auth/onboarding?spotify=connected', request.url))

  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(new URL('/auth/onboarding?error=spotify_error', request.url))
  }
}