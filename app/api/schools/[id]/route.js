import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Get single school
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const schools = await db.getSchools()
    const school = schools.find(s => s.id === id)
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, school })
  } catch (error) {
    console.error('Get school error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch school' },
      { status: 500 }
    )
  }
}

// Update school
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, address, state, country } = body

    if (!name || !state) {
      return NextResponse.json(
        { error: 'Name and state are required' },
        { status: 400 }
      )
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('school')
      .update({ name, address, state, country })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, school: data })
  } catch (error) {
    console.error('Update school error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update school' },
      { status: 500 }
    )
  }
}

// Delete school (soft delete)
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('school')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'School deleted' })
  } catch (error) {
    console.error('Delete school error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete school' },
      { status: 500 }
    )
  }
}
