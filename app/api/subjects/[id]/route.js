import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const subjects = await db.getSubjects()
    const subject = subjects.find(s => s.id === id)
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, subject })
  } catch (error) {
    console.error('Get subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subject' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, school_id, curriculum_id, grade_id, book_id } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const updateData = { name }
    if (school_id) updateData.school_id = parseInt(school_id)
    if (curriculum_id) updateData.curriculum_id = parseInt(curriculum_id)
    if (grade_id) updateData.grade_id = parseInt(grade_id)
    if (book_id) updateData.book_id = parseInt(book_id)
    
    const { data, error } = await supabase
      .from('subject')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, subject: data })
  } catch (error) {
    console.error('Update subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update subject' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('subject')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Subject deleted' })
  } catch (error) {
    console.error('Delete subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
