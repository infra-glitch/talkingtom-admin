import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    const lessons = await db.getLessons(bookId ? parseInt(bookId) : null)
    
    return NextResponse.json({ success: true, lessons })
  } catch (error) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { book_id, lesson_number, name, thumbnail = '' } = body

    if (!book_id || !lesson_number || !name) {
      return NextResponse.json(
        { error: 'book_id, lesson_number, and name are required' },
        { status: 400 }
      )
    }

    const lesson = await db.createLesson({
      book_id: parseInt(book_id),
      lesson_number: parseInt(lesson_number),
      name,
      thumbnail,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      num_topics: 0,
      active: true
    })
    
    return NextResponse.json({ success: true, lesson })
  } catch (error) {
    console.error('Create lesson error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
