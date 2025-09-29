import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Check if user has completed onboarding
  // This will be implemented later with database check
  const hasCompletedOnboarding = false

  if (!hasCompletedOnboarding) {
    redirect('/auth/onboarding')
  }

  redirect('/chat')
}