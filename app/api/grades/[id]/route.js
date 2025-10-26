import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const grades = await db.getGrades()
    const grade = grades.find(g => g.id === id)
    
    if (!grade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, grade })
  } catch (error) {
    console.error('Get grade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch grade' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { grade } = body

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade is required' },
        { status: 400 }
      )
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('grade')
      .update({ grade })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, grade: data })
  } catch (error) {
    console.error('Update grade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update grade' },
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
      .from('grade')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Grade deleted' })
  } catch (error) {
    console.error('Delete grade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete grade' },
      { status: 500 }
    )
  }
}
