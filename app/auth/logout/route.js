import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createClient()
  await supabase.auth.signOut()
  
  const origin = request.headers.get('origin')
  return NextResponse.redirect(`${origin}/login`)
}
