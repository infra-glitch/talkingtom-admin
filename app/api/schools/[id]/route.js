import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single school
export async function GET(request, { params }) {
  try {
    const { id } = params
    const school = await db.getSchoolById(id)
    return NextResponse.json({ success: true, school })
  } catch (error) {
    console.error('Get school error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch school' },
      { status: 500 }
    )
  }
}

// PUT update school
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, address, state, country } = body

    if (!name || !state) {
      return NextResponse.json(
        { error: 'Name and state are required' },
        { status: 400 }
      )
    }

    const school = await db.updateSchool(id, {
      name,
      address: address || null,
      state,
      country: country || 'India',
      updated_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, school })
  } catch (error) {
    console.error('Update school error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update school' },
      { status: 500 }
    )
  }
}

// DELETE (soft delete) school
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const school = await db.deleteSchool(id)
    return NextResponse.json({ success: true, school })
  } catch (error) {
    console.error('Delete school error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete school' },
      { status: 500 }
    )
  }
}
