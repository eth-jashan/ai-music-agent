import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { SoundCloudClient } from '@/lib/soundcloud/client'
import { db } from '@/lib/db'
import { env } from '@/lib/env'

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
      console.error('SoundCloud OAuth error:', error)
      return NextResponse.redirect(new URL('/auth/onboarding?error=soundcloud_denied', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth/onboarding?error=soundcloud_no_code', request.url))
    }

    // Exchange code for tokens
    const tokenData = await SoundCloudClient.exchangeCodeForToken(code)

    // Get user info from SoundCloud
    const soundcloudClient = new SoundCloudClient(env.SOUNDCLOUD_CLIENT_ID, tokenData.access_token)
    const soundcloudUser = await soundcloudClient.getUserProfile()

    // Find the user in our database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?error=user_not_found', request.url))
    }

    // Save or update the SoundCloud connection
    await db.connection.upsert({
      where: {
        userId_service: {
          userId: user.id,
          service: 'soundcloud',
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        serviceUserId: soundcloudUser.id.toString(),
      },
      create: {
        userId: user.id,
        service: 'soundcloud',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        serviceUserId: soundcloudUser.id.toString(),
      },
    })

    // Redirect back to onboarding with success
    return NextResponse.redirect(new URL('/auth/onboarding?soundcloud=connected', request.url))

  } catch (error) {
    console.error('SoundCloud callback error:', error)
    return NextResponse.redirect(new URL('/auth/onboarding?error=soundcloud_error', request.url))
  }
}