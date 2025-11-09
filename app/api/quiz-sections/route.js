import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lesson_id')

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lesson_id is required' },
        { status: 400 }
      )
    }

    const sections = await db.getQuizSections(lessonId)
    return NextResponse.json({ success: true, sections })
  } catch (error) {
    console.error('Get quiz sections error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz sections' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { lesson_id, name, order } = body

    if (!lesson_id || !name || order === undefined) {
      return NextResponse.json(
        { error: 'lesson_id, name, and order are required' },
        { status: 400 }
      )
    }

    // Fetch lesson to get book_id
    const lesson = await db.getLessonById(lesson_id)
    if (!lesson || !lesson.book_id) {
      return NextResponse.json(
        { error: 'Invalid lesson_id or lesson has no book_id' },
        { status: 400 }
      )
    }

    const section = await db.createQuizSection({
      lesson_id,
      book_id: lesson.book_id,
      name,
      order,
      num_questions: 0,
      active: true
    })
    
    return NextResponse.json({ success: true, section })
  } catch (error) {
    console.error('Create quiz section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create quiz section' },
      { status: 500 }
    )
  }
}
