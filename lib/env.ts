import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Spotify API
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_REDIRECT_URI: z.string().url(),

  // SoundCloud API
  SOUNDCLOUD_CLIENT_ID: z.string().min(1),
  SOUNDCLOUD_CLIENT_SECRET: z.string().min(1).optional(),
  SOUNDCLOUD_REDIRECT_URI: z.string().url().optional(),

  // AI
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Analytics (optional)
  POSTHOG_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function validateEnv() {
  try {
    const env = envSchema.parse(process.env)

    // Ensure at least one AI API key is provided
    if (!env.OPENAI_API_KEY && !env.ANTHROPIC_API_KEY) {
      throw new Error('Either OPENAI_API_KEY or ANTHROPIC_API_KEY must be provided')
    }

    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((err) => err.path.join('.')).join(', ')
      throw new Error(`Missing or invalid environment variables: ${missing}`)
    }
    throw error
  }
}

export const env = validateEnv()

export type Env = z.infer<typeof envSchema>