import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single book
export async function GET(request, { params }) {
  try {
    const { id } = params
    const book = await db.getBookById(id)
    return NextResponse.json({ success: true, book })
  } catch (error) {
    console.error('Get book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

// PUT update book
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, author, slug } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const book = await db.updateBook(id, {
      title,
      author: author || null,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      updated_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true, book })
  } catch (error) {
    console.error('Update book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update book' },
      { status: 500 }
    )
  }
}

// DELETE (soft delete) book
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const book = await db.deleteBook(id)
    return NextResponse.json({ success: true, book })
  } catch (error) {
    console.error('Delete book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}
