import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const curriculums = await db.getCurriculums()
    const curriculum = curriculums.find(c => c.id === id)
    
    if (!curriculum) {
      return NextResponse.json(
        { error: 'Curriculum not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, curriculum })
  } catch (error) {
    console.error('Get curriculum error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch curriculum' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, country } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('curriculum')
      .update({ name, country: country || 'India' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, curriculum: data })
  } catch (error) {
    console.error('Update curriculum error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update curriculum' },
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
      .from('curriculum')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Curriculum deleted' })
  } catch (error) {
    console.error('Delete curriculum error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete curriculum' },
      { status: 500 }
    )
  }
}
