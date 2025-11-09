import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('section_id')

    if (!sectionId) {
      return NextResponse.json(
        { error: 'section_id is required' },
        { status: 400 }
      )
    }

    const questions = await db.getQuizQuestions(sectionId)
    return NextResponse.json({ success: true, questions })
  } catch (error) {
    console.error('Get quiz questions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz questions' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { section_id, question_type, question, answer } = body

    if (!section_id || !question_type || !question) {
      return NextResponse.json(
        { error: 'section_id, question_type, and question are required' },
        { status: 400 }
      )
    }

    const questionData = await db.createQuizQuestion({
      section_id,
      question_type,
      question,
      answer,
      active: true
    })
    
    return NextResponse.json({ success: true, question: questionData })
  } catch (error) {
    console.error('Create quiz question error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create quiz question' },
      { status: 500 }
    )
  }
}
