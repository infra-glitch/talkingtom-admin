import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const grades = await db.getGrades()
    return NextResponse.json({ success: true, grades })
  } catch (error) {
    console.error('Get grades error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch grades' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { grade } = body

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade is required' },
        { status: 400 }
      )
    }

    const newGrade = await db.createGrade({
      grade,
      active: true
    })
    
    return NextResponse.json({ success: true, grade: newGrade })
  } catch (error) {
    console.error('Create grade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create grade' },
      { status: 500 }
    )
  }
}
