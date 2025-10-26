import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single curriculum
export async function GET(request, { params }) {
  try {
    const { id } = params
    const curriculum = await db.getCurriculumById(id)
    return NextResponse.json({ success: true, curriculum })
  } catch (error) {
    console.error('Get curriculum error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch curriculum' },
      { status: 500 }
    )
  }
}

// PUT update curriculum
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, country } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const curriculum = await db.updateCurriculum(id, {
      name,
      country: country || 'India',
      updated_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, curriculum })
  } catch (error) {
    console.error('Update curriculum error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update curriculum' },
      { status: 500 }
    )
  }
}

// DELETE (soft delete) curriculum
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const curriculum = await db.deleteCurriculum(id)
    return NextResponse.json({ success: true, curriculum })
  } catch (error) {
    console.error('Delete curriculum error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete curriculum' },
      { status: 500 }
    )
  }
}
