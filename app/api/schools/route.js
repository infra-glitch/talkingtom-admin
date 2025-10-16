import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const schools = await db.getSchools()
    return NextResponse.json({ success: true, schools })
  } catch (error) {
    console.error('Get schools error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, address, state, country = 'India' } = body

    if (!name || !state) {
      return NextResponse.json(
        { error: 'Name and state are required' },
        { status: 400 }
      )
    }

    const school = await db.createSchool({
      name,
      address: address || null,
      state,
      country,
      active: true
    })
    
    return NextResponse.json({ success: true, school })
  } catch (error) {
    console.error('Create school error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create school' },
      { status: 500 }
    )
  }
}
