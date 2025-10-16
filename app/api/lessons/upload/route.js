import { NextResponse } from 'next/server'
import { storage, db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get('pdf')
    const lessonId = formData.get('lessonId')

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Verify lesson exists
    const lesson = await db.getLessonById(parseInt(lessonId))
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Upload PDF to Supabase Storage
    try {
      const pdfBuffer = await pdfFile.arrayBuffer()
      const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
      
      await storage.uploadPDF(pdfBlob, lessonId)
      
      // Update lesson with PDF URL
      const pdfUrl = storage.getPublicUrl('lesson-pdfs', `lessons/${lessonId}/original.pdf`)
      await db.updateLesson(parseInt(lessonId), {
        thumbnail: pdfUrl // Store PDF URL in thumbnail for now
      })
    } catch (storageError) {
      console.error('Storage error:', storageError)
      throw storageError
    }

    return NextResponse.json({
      success: true,
      lessonId,
      message: 'PDF uploaded successfully. Processing will begin shortly.'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload PDF' },
      { status: 500 }
    )
  }
}
