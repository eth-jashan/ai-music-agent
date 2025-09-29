'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.ok) {
        // Get the session to check user status
        const session = await getSession()
        if (session) {
          router.push('/')
        }
      } else {
        console.error('Sign in failed:', result?.error)
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <Music className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Smart Mode
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Your personal AI DJ
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription className="text-base">
              Sign in to create amazing playlists with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4 text-center">
              <div className="text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">What you'll get:</h3>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              AI-powered playlist generation
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full" />
              Spotify & SoundCloud integration
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              Natural language music discovery
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}