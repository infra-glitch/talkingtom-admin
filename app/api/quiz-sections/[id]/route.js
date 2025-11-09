import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const section = await db.getQuizSectionById(id)
    return NextResponse.json({ success: true, section })
  } catch (error) {
    console.error('Get quiz section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz section' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, order } = body

    if (!name || order === undefined) {
      return NextResponse.json(
        { error: 'name and order are required' },
        { status: 400 }
      )
    }

    const section = await db.updateQuizSection(id, {
      name,
      order,
      updated_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, section })
  } catch (error) {
    console.error('Update quiz section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update quiz section' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const section = await db.deleteQuizSection(id)
    return NextResponse.json({ success: true, section })
  } catch (error) {
    console.error('Delete quiz section error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete quiz section' },
      { status: 500 }
    )
  }
}
