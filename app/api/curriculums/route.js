import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const curriculums = await db.getCurriculums()
    return NextResponse.json({ success: true, curriculums })
  } catch (error) {
    console.error('Get curriculums error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch curriculums' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, country = 'India' } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const curriculum = await db.createCurriculum({
      name,
      country,
      active: true
    })
    
    return NextResponse.json({ success: true, curriculum })
  } catch (error) {
    console.error('Create curriculum error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create curriculum' },
      { status: 500 }
    )
  }
}
