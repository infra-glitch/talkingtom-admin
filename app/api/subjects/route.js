import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const subjects = await db.getSubjects()
    return NextResponse.json({ success: true, subjects })
  } catch (error) {
    console.error('Get subjects error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, school_id, curriculum_id, grade_id, book_id } = body

    if (!name || !school_id || !curriculum_id || !grade_id || !book_id) {
      return NextResponse.json(
        { error: 'All fields are required: name, school_id, curriculum_id, grade_id, book_id' },
        { status: 400 }
      )
    }

    const subject = await db.createSubject({
      name,
      school_id,
      curriculum_id,
      grade_id,
      book_id,
      active: true
    })
    
    return NextResponse.json({ success: true, subject })
  } catch (error) {
    console.error('Create subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subject' },
      { status: 500 }
    )
  }
}
