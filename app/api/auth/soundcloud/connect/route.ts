import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { SoundCloudClient } from '@/lib/soundcloud/client'
import { randomId } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a state parameter for security
    const state = randomId()

    // Generate the SoundCloud OAuth URL
    const authUrl = SoundCloudClient.generateAuthUrl(state)

    // In a production app, you might want to store the state in a session or database
    // For now, we'll just redirect to the OAuth URL
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('SoundCloud connect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}