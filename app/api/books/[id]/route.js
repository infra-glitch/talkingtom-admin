import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const books = await db.getBooks()
    const book = books.find(b => b.id === id)
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, book })
  } catch (error) {
    console.error('Get book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { title, author, slug } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const updateData = {
      title,
      author: author || null,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-')
    }

    const updatedBook = await db.updateBook(id, updateData)
    
    return NextResponse.json({ success: true, book: updatedBook })
  } catch (error) {
    console.error('Update book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update book' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('book')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Book deleted' })
  } catch (error) {
    console.error('Delete book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}
