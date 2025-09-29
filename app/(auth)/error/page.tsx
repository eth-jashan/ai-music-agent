'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link was invalid or has expired.',
  Default: 'An unexpected error occurred during authentication.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl text-destructive">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-base">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>

            {error === 'Configuration' && (
              <div className="text-sm text-muted-foreground text-center">
                Please contact support if this error persists.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}