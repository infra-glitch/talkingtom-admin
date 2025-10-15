import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const books = await db.getBooks()
    return NextResponse.json({ success: true, books })
  } catch (error) {
    console.error('Get books error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, author, slug } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const book = await db.createBook({
      title,
      author: author || null,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      active: true
    })
    
    return NextResponse.json({ success: true, book })
  } catch (error) {
    console.error('Create book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create book' },
      { status: 500 }
    )
  }
}
