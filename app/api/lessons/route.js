import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Get all lessons
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    const lessons = await db.getLessons(bookId)
    
    return NextResponse.json({
      success: true,
      lessons
    })
  } catch (error) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}
