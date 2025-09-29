import { env } from '@/lib/env'
import { SpotifyTrack, SpotifyArtist, SpotifyAlbum, SpotifyPlaylist, SpotifyUser } from '@/types'

export interface RecommendationParams {
  seed_artists?: string
  seed_genres?: string
  seed_tracks?: string
  limit?: number
  market?: string
  min_energy?: number
  max_energy?: number
  min_danceability?: number
  max_danceability?: number
  min_valence?: number
  max_valence?: number
  min_tempo?: number
  max_tempo?: number
  target_energy?: number
  target_danceability?: number
  target_valence?: number
  target_tempo?: number
}

export class SpotifyClient {
  private accessToken: string
  private baseUrl = 'https://api.spotify.com/v1'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Spotify API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    return response.json()
  }

  async getUserProfile(): Promise<SpotifyUser> {
    return this.makeRequest<SpotifyUser>('/me')
  }

  async getTopArtists(limit = 50, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') {
    const response = await this.makeRequest<{ items: SpotifyArtist[] }>(`/me/top/artists?limit=${limit}&time_range=${timeRange}`)
    return response.items
  }

  async getTopTracks(limit = 50, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') {
    const response = await this.makeRequest<{ items: SpotifyTrack[] }>(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`)
    return response.items
  }

  async getUserPlaylists(limit = 50, offset = 0) {
    const response = await this.makeRequest<{ items: SpotifyPlaylist[] }>(`/me/playlists?limit=${limit}&offset=${offset}`)
    return response.items
  }

  async getPlaylistTracks(playlistId: string, limit = 100, offset = 0) {
    const response = await this.makeRequest<{ items: Array<{ track: SpotifyTrack }> }>(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`)
    return response.items.map(item => item.track)
  }

  async searchTracks(query: string, limit = 20, market = 'US') {
    const encodedQuery = encodeURIComponent(query)
    const response = await this.makeRequest<{ tracks: { items: SpotifyTrack[] } }>(`/search?q=${encodedQuery}&type=track&limit=${limit}&market=${market}`)
    return response.tracks.items
  }

  async searchArtists(query: string, limit = 20, market = 'US') {
    const encodedQuery = encodeURIComponent(query)
    const response = await this.makeRequest<{ artists: { items: SpotifyArtist[] } }>(`/search?q=${encodedQuery}&type=artist&limit=${limit}&market=${market}`)
    return response.artists.items
  }

  async getRecommendations(params: RecommendationParams) {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    const response = await this.makeRequest<{ tracks: SpotifyTrack[] }>(`/recommendations?${queryParams}`)
    return response.tracks
  }

  async getTrackAudioFeatures(trackIds: string[]) {
    const ids = trackIds.join(',')
    const response = await this.makeRequest<{ audio_features: Array<{
      id: string
      energy: number
      danceability: number
      valence: number
      tempo: number
      acousticness: number
      instrumentalness: number
      liveness: number
      speechiness: number
    }> }>(`/audio-features?ids=${ids}`)
    return response.audio_features
  }

  async createPlaylist(userId: string, name: string, description: string, isPublic = false) {
    const response = await this.makeRequest<SpotifyPlaylist>(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    })
    return response
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    // Spotify allows maximum 100 tracks per request
    const chunks = []
    for (let i = 0; i < trackUris.length; i += 100) {
      chunks.push(trackUris.slice(i, i + 100))
    }

    const results = []
    for (const chunk of chunks) {
      const response = await this.makeRequest<{ snapshot_id: string }>(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        body: JSON.stringify({
          uris: chunk,
        }),
      })
      results.push(response)
    }

    return results
  }

  async getAvailableGenres() {
    const response = await this.makeRequest<{ genres: string[] }>('/recommendations/available-genre-seeds')
    return response.genres
  }

  async getCurrentUserProfile() {
    return this.makeRequest<SpotifyUser>('/me')
  }

  // Helper method to refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token?: string
    expires_in: number
  }> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh Spotify token: ${response.statusText}`)
    }

    return response.json()
  }

  // Helper method to generate OAuth URL
  static generateAuthUrl(state?: string): string {
    const scopes = [
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-library-read',
      'playlist-modify-public',
      'playlist-modify-private',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state',
    ].join(' ')

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: env.SPOTIFY_REDIRECT_URI,
      ...(state && { state }),
    })

    return `https://accounts.spotify.com/authorize?${params}`
  }

  // Helper method to exchange authorization code for access token
  static async exchangeCodeForToken(code: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
  }> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.SPOTIFY_REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to exchange code for token: ${errorData.error_description || response.statusText}`)
    }

    return response.json()
  }
}