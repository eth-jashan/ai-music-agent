import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { env } from '@/lib/env'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }

      // Add user data from database to token
      if (token.email) {
        const user = await db.user.findUnique({
          where: { email: token.email },
          include: {
            connections: true,
            musicProfiles: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        })

        if (user) {
          token.userId = user.id
          token.hasSpotifyConnection = user.connections.some(c => c.service === 'spotify')
          token.hasSoundCloudConnection = user.connections.some(c => c.service === 'soundcloud')
          token.hasMusicProfile = user.musicProfiles.length > 0
        }
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
        },
        accessToken: token.accessToken as string,
        hasSpotifyConnection: token.hasSpotifyConnection as boolean,
        hasSoundCloudConnection: token.hasSoundCloudConnection as boolean,
        hasMusicProfile: token.hasMusicProfile as boolean,
      }
    },
    async signIn({ account, profile }) {
      // Allow sign in
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async signIn(message) {
      // Log successful sign-ins
      console.log('User signed in:', message.user.email)
    },
    async createUser(message) {
      // Log new user creation
      console.log('New user created:', message.user.email)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}