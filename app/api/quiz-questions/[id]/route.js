import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const question = await db.getQuizQuestionById(id)
    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error('Get quiz question error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz question' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { question_type, question, answer, order } = body

    if (!question_type || !question) {
      return NextResponse.json(
        { error: 'question_type and question are required' },
        { status: 400 }
      )
    }

    const questionData = await db.updateQuizQuestion(id, {
      question_type,
      question,
      answer,
      order: order || 1,
      updated_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, question: questionData })
  } catch (error) {
    console.error('Update quiz question error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update quiz question' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const question = await db.deleteQuizQuestion(id)
    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error('Delete quiz question error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete quiz question' },
      { status: 500 }
    )
  }
}
