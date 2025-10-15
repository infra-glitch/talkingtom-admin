import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Get all books
export async function GET() {
  try {
    const books = await db.getBooks()
    
    return NextResponse.json({
      success: true,
      books
    })
  } catch (error) {
    console.error('Get books error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// Create a new book
export async function POST(request) {
  try {
    const { title, description, grade, subject } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const bookData = {
      id: uuidv4(),
      title,
      description: description || '',
      grade: grade || '',
      subject: subject || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const book = await db.createBook(bookData)
    
    return NextResponse.json({
      success: true,
      book
    })
  } catch (error) {
    console.error('Create book error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create book' },
      { status: 500 }
    )
  }
}
