import { NextResponse } from 'next/server'
import { supabase, storage, db } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get('pdf')
    const bookId = formData.get('bookId')
    const lessonNumber = formData.get('lessonNumber')
    const lessonName = formData.get('lessonName')

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    if (!bookId || !lessonNumber || !lessonName) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId, lessonNumber, or lessonName' },
        { status: 400 }
      )
    }

    // Generate unique lesson ID
    const lessonId = uuidv4()

    // Create lesson record in database
    const lessonData = {
      id: lessonId,
      book_id: bookId,
      lesson_number: parseInt(lessonNumber),
      name: lessonName,
      thumbnail: '',
      slug: lessonName.toLowerCase().replace(/\s+/g, '-'),
      num_topics: 0,
      status: 'uploading',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const lesson = await db.createLesson(lessonData)

    // Upload PDF to Supabase Storage
    try {
      const pdfBuffer = await pdfFile.arrayBuffer()
      const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
      
      await storage.uploadPDF(pdfBlob, lessonId)
      
      // Update lesson status
      await db.updateLesson(lessonId, {
        status: 'uploaded',
        pdf_url: storage.getPublicUrl('lesson-pdfs', `lessons/${lessonId}/original.pdf`)
      })
    } catch (storageError) {
      console.error('Storage error:', storageError)
      await db.updateLesson(lessonId, { status: 'upload_failed' })
      throw storageError
    }

    // Create processing job
    const jobData = {
      id: uuidv4(),
      lesson_id: lessonId,
      status: 'pending',
      stage: 'queued',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    await db.createProcessingJob(jobData)

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
