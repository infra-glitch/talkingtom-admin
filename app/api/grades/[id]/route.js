import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single grade
export async function GET(request, { params }) {
  try {
    const { id } = params
    const grade = await db.getGradeById(id)
    return NextResponse.json({ success: true, grade })
  } catch (error) {
    console.error('Get grade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch grade' },
      { status: 500 }
    )
  }
}

// PUT update grade
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { grade } = body

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade is required' },
        { status: 400 }
      )
    }

    const updatedGrade = await db.updateGrade(id, {
      grade,
      updated_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, grade: updatedGrade })
  } catch (error) {
    console.error('Update grade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update grade' },
      { status: 500 }
    )
  }
}

// DELETE (soft delete) grade
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const grade = await db.deleteGrade(id)
    return NextResponse.json({ success: true, grade })
  } catch (error) {
    console.error('Delete grade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete grade' },
      { status: 500 }
    )
  }
}
