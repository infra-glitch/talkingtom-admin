import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createClient()
  const requestUrl = new URL(request.url)
  
  // Get the actual base URL from environment or request
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin
  const redirectTo = `${baseUrl}/auth/callback`

  console.log('Initiating OAuth login:', { baseUrl, redirectTo })

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`)
  }

  console.log('Redirecting to OAuth provider:', data.url)
  // Redirect to Google OAuth (GET request)
  return NextResponse.redirect(data.url)
}
