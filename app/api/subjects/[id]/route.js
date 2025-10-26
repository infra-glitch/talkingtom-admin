import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single subject
export async function GET(request, { params }) {
  try {
    const { id } = params
    const subject = await db.getSubjectById(id)
    return NextResponse.json({ success: true, subject })
  } catch (error) {
    console.error('Get subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subject' },
      { status: 500 }
    )
  }
}

// PUT update subject
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, school_id, curriculum_id, grade_id, book_id } = body

    if (!name || !school_id || !curriculum_id || !grade_id) {
      return NextResponse.json(
        { error: 'Name, school_id, curriculum_id, and grade_id are required' },
        { status: 400 }
      )
    }

    // Validate that book_id is provided (subjects must have book mapping)
    if (!book_id) {
      return NextResponse.json(
        { error: 'Book mapping is required for subjects' },
        { status: 400 }
      )
    }

    const subject = await db.updateSubject(id, {
      name,
      school_id,
      curriculum_id,
      grade_id,
      book_id,
      updated_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, subject })
  } catch (error) {
    console.error('Update subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update subject' },
      { status: 500 }
    )
  }
}

// DELETE (soft delete) subject
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const subject = await db.deleteSubject(id)
    return NextResponse.json({ success: true, subject })
  } catch (error) {
    console.error('Delete subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
