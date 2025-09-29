export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  user_id: string
  service: 'spotify' | 'soundcloud'
  access_token?: string
  refresh_token?: string
  expires_at?: string
  service_user_id?: string
  created_at: string
}

export interface MusicProfile {
  id: string
  user_id: string
  top_artists: SpotifyArtist[]
  top_tracks: SpotifyTrack[]
  top_genres: string[]
  audio_features: AudioFeatures
  last_analyzed: string
  created_at: string
}

export interface AudioFeatures {
  avg_energy: number
  avg_danceability: number
  avg_valence: number
  avg_tempo: number
  avg_acousticness: number
  avg_instrumentalness: number
  avg_liveness: number
  avg_speechiness: number
}

export interface Conversation {
  id: string
  user_id: string
  title?: string
  created_at: string
  updated_at: string
  messages: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  playlist_data?: Playlist
  created_at: string
}

export interface Playlist {
  id: string
  user_id: string
  message_id?: string
  name: string
  description?: string
  tracks: Track[]
  total_duration: number
  prompt?: string
  exported_to: string[]
  created_at: string
}

export interface Track {
  id: string
  name: string
  artist: string
  album?: string
  duration_ms: number
  preview_url?: string
  image_url?: string
  external_urls: {
    spotify?: string
    soundcloud?: string
  }
  source: 'spotify' | 'soundcloud'
  uri: string
}

// Spotify API Types
export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  preview_url?: string
  external_urls: {
    spotify: string
  }
  uri: string
}

export interface SpotifyArtist {
  id: string
  name: string
  genres: string[]
  images: SpotifyImage[]
  external_urls: {
    spotify: string
  }
  uri: string
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  release_date: string
  external_urls: {
    spotify: string
  }
  uri: string
}

export interface SpotifyImage {
  url: string
  height?: number
  width?: number
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description?: string
  images: SpotifyImage[]
  tracks: {
    total: number
  }
  external_urls: {
    spotify: string
  }
  uri: string
}

// SoundCloud API Types
export interface SoundCloudTrack {
  id: number
  title: string
  user: SoundCloudUser
  duration: number
  stream_url?: string
  artwork_url?: string
  permalink_url: string
  uri: string
}

export interface SoundCloudUser {
  id: number
  username: string
  full_name?: string
  avatar_url?: string
  permalink_url: string
}

export interface SoundCloudPlaylist {
  id: number
  title: string
  description?: string
  user: SoundCloudUser
  tracks: SoundCloudTrack[]
  artwork_url?: string
  permalink_url: string
}

// AI/Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  playlist?: Playlist
}

export interface MixtapeRequest {
  prompt: string
  user_profile: MusicProfile
  conversation_history?: ChatMessage[]
  preferences?: {
    duration?: number
    track_count?: number
    energy_profile?: 'ascending' | 'descending' | 'steady' | 'variable'
    include_spotify?: boolean
    include_soundcloud?: boolean
  }
}

export interface MixtapeResponse {
  name: string
  description: string
  explanation: string
  tracks: Track[]
  mood_tags: string[]
  energy_profile: string
  total_duration: number
}

// Component Props Types
export interface PlaylistCardProps {
  playlist: Playlist
  onPlay?: (track: Track) => void
  onExport?: (service: 'spotify' | 'soundcloud') => void
  className?: string
}

export interface TrackItemProps {
  track: Track
  onPlay?: () => void
  showArtwork?: boolean
  showDuration?: boolean
  className?: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// Error Types
export interface ApiError {
  message: string
  code?: string
  status?: number
}

// OAuth Types
export interface OAuthState {
  isConnected: boolean
  isLoading: boolean
  error?: string
}

export interface SpotifyConnectionState extends OAuthState {
  user?: SpotifyUser
  scopes?: string[]
}

export interface SoundCloudConnectionState extends OAuthState {
  user?: SoundCloudUser
}

export interface SpotifyUser {
  id: string
  display_name?: string
  email?: string
  images: SpotifyImage[]
  country: string
  followers: {
    total: number
  }
  external_urls: {
    spotify: string
  }
}

// Onboarding Types
export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  optional?: boolean
}

export interface OnboardingState {
  current_step: number
  steps: OnboardingStep[]
  profile_analysis_complete: boolean
  connections: {
    spotify: boolean
    soundcloud: boolean
  }
}