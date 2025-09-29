import { env } from '@/lib/env'
import { SoundCloudTrack, SoundCloudUser, SoundCloudPlaylist } from '@/types'

export class SoundCloudClient {
  private clientId: string
  private accessToken?: string
  private baseUrl = 'https://api.soundcloud.com'

  constructor(clientId: string, accessToken?: string) {
    this.clientId = clientId
    this.accessToken = accessToken
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    // Add client_id to all requests
    url.searchParams.append('client_id', this.clientId)

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers as Record<string, string>,
    }

    // Add OAuth token if available
    if (this.accessToken) {
      headers.Authorization = `OAuth ${this.accessToken}`
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`SoundCloud API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    return response.json()
  }

  async getUserProfile(): Promise<SoundCloudUser> {
    if (!this.accessToken) {
      throw new Error('Access token required for user profile')
    }
    return this.makeRequest<SoundCloudUser>('/me')
  }

  async getUserLikes(limit = 50, offset = 0) {
    if (!this.accessToken) {
      throw new Error('Access token required for user likes')
    }
    const response = await this.makeRequest<SoundCloudTrack[]>(`/me/likes?limit=${limit}&offset=${offset}`)
    return response
  }

  async getUserFollowings(limit = 50, offset = 0) {
    if (!this.accessToken) {
      throw new Error('Access token required for user followings')
    }
    const response = await this.makeRequest<SoundCloudUser[]>(`/me/followings?limit=${limit}&offset=${offset}`)
    return response
  }

  async getUserPlaylists(limit = 50, offset = 0) {
    if (!this.accessToken) {
      throw new Error('Access token required for user playlists')
    }
    const response = await this.makeRequest<SoundCloudPlaylist[]>(`/me/playlists?limit=${limit}&offset=${offset}`)
    return response
  }

  async getUserTracks(limit = 50, offset = 0) {
    if (!this.accessToken) {
      throw new Error('Access token required for user tracks')
    }
    const response = await this.makeRequest<SoundCloudTrack[]>(`/me/tracks?limit=${limit}&offset=${offset}`)
    return response
  }

  async searchTracks(query: string, limit = 20, offset = 0) {
    const encodedQuery = encodeURIComponent(query)
    const response = await this.makeRequest<SoundCloudTrack[]>(`/tracks?q=${encodedQuery}&limit=${limit}&offset=${offset}`)
    return response
  }

  async searchUsers(query: string, limit = 20, offset = 0) {
    const encodedQuery = encodeURIComponent(query)
    const response = await this.makeRequest<SoundCloudUser[]>(`/users?q=${encodedQuery}&limit=${limit}&offset=${offset}`)
    return response
  }

  async getTrackDetails(trackId: string | number): Promise<SoundCloudTrack> {
    return this.makeRequest<SoundCloudTrack>(`/tracks/${trackId}`)
  }

  async getUserDetails(userId: string | number): Promise<SoundCloudUser> {
    return this.makeRequest<SoundCloudUser>(`/users/${userId}`)
  }

  async getPlaylistDetails(playlistId: string | number): Promise<SoundCloudPlaylist> {
    return this.makeRequest<SoundCloudPlaylist>(`/playlists/${playlistId}`)
  }

  // Get trending tracks
  async getTrendingTracks(genre?: string, limit = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(genre && { tags: genre }),
    })
    return this.makeRequest<SoundCloudTrack[]>(`/tracks?${params}`)
  }

  // Helper method to refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token?: string
    expires_in: number
  }> {
    const response = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: env.SOUNDCLOUD_CLIENT_ID,
        client_secret: env.SOUNDCLOUD_CLIENT_SECRET || '',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh SoundCloud token: ${response.statusText}`)
    }

    return response.json()
  }

  // Helper method to generate OAuth URL
  static generateAuthUrl(state?: string): string {
    const scopes = [
      'non-expiring',
    ].join(' ')

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.SOUNDCLOUD_CLIENT_ID,
      scope: scopes,
      redirect_uri: env.SOUNDCLOUD_REDIRECT_URI || `${env.NEXTAUTH_URL}/api/auth/soundcloud/callback`,
      ...(state && { state }),
    })

    return `https://api.soundcloud.com/connect?${params}`
  }

  // Helper method to exchange authorization code for access token
  static async exchangeCodeForToken(code: string): Promise<{
    access_token: string
    refresh_token?: string
    expires_in?: number
    token_type: string
  }> {
    const response = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: env.SOUNDCLOUD_CLIENT_ID,
        client_secret: env.SOUNDCLOUD_CLIENT_SECRET || '',
        redirect_uri: env.SOUNDCLOUD_REDIRECT_URI || `${env.NEXTAUTH_URL}/api/auth/soundcloud/callback`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to exchange code for token: ${errorData.error_description || response.statusText}`)
    }

    return response.json()
  }

  // Convert SoundCloud track to our unified Track format
  static convertToUnifiedTrack(track: SoundCloudTrack) {
    return {
      id: track.id.toString(),
      name: track.title,
      artist: track.user.username,
      duration_ms: track.duration,
      preview_url: track.stream_url,
      image_url: track.artwork_url,
      external_urls: {
        soundcloud: track.permalink_url,
      },
      source: 'soundcloud' as const,
      uri: track.uri,
    }
  }
}