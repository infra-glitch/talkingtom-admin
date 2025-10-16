import { NextResponse } from 'next/server'
import { db, storage } from '@/lib/db'
import pdfProcessor from '@/lib/services/pdfProcessor'
import ocrService from '@/lib/services/ocrService'
import aiSegmentation from '@/lib/services/aiSegmentation'
import ttsService from '@/lib/services/ttsService'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Store processing status in memory (in production, use Redis or database)
const processingStatus = new Map()

export async function POST(request) {
  try {
    const { lessonId } = await request.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    const lessonIdInt = parseInt(lessonId)

    // Get lesson details
    const lesson = await db.getLessonById(lessonIdInt)
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Initialize processing status
    processingStatus.set(lessonIdInt, {
      lessonId: lessonIdInt,
      status: 'processing',
      stage: 'starting',
      progress: 0,
      startedAt: new Date().toISOString()
    })

    // Start processing in background
    processLesson(lessonIdInt).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Processing started',
      lessonId: lessonIdInt
    })
  } catch (error) {
    console.error('Process initiation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start processing' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId required' },
        { status: 400 }
      )
    }

    const lessonIdInt = parseInt(lessonId)
    const status = processingStatus.get(lessonIdInt)

    if (!status) {
      return NextResponse.json({
        lessonId: lessonIdInt,
        status: 'pending',
        stage: 'queued',
        progress: 0
      })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    )
  }
}

async function processLesson(lessonId) {
  try {
    console.log(`Starting processing for lesson ${lessonId}...`)

    // Stage 1: Extract page images
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      stage: 'pdf_extraction',
      progress: 10
    })

    const pages = await pdfProcessor.extractPageImages(null)
    
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      progress: 20,
      metadata: { totalPages: pages.length }
    })

    // Stage 2: OCR Processing
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      stage: 'ocr_processing',
      progress: 30
    })

    const ocrResults = await ocrService.batchProcessPages(pages)
    const fullText = ocrResults.map(r => r.fullText).join('\n\n')

    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      progress: 50
    })

    // Stage 3: AI Segmentation
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      stage: 'ai_segmentation',
      progress: 60
    })

    let topics = await aiSegmentation.segmentLessonContent(fullText, ocrResults)
    const allDetectedImages = ocrResults.flatMap(r => r.detectedImages || [])
    topics = await aiSegmentation.mapImagesToSegments(topics, allDetectedImages)

    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      progress: 70,
      metadata: { topicsCount: topics.length }
    })

    // Stage 4: TTS Generation
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      stage: 'tts_generation',
      progress: 75
    })

    for (const topic of topics) {
      for (const segment of topic.simplifiedExplanation) {
        const audio = await ttsService.generateAudio(segment.text, segment.id)
        segment.audioSrcUrl = `https://storage.example.com/audio/${segment.id}.mp3`
      }
    }

    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      progress: 90
    })

    // Stage 5: Save to Database
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      stage: 'database_save',
      progress: 95
    })

    for (const topic of topics) {
      await db.createLessonTopic({
        lesson_id: lessonId,
        topic_id: topic.topicId,
        topic: topic.topic,
        subtopic: topic.subtopic,
        order: topic.order,
        simplified_explanation: topic.simplifiedExplanation,
        active: true
      })
    }

    // Update lesson
    await db.updateLesson(lessonId, {
      num_topics: topics.length
    })

    // Mark as complete
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      status: 'completed',
      stage: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    })

    console.log(`Processing completed for lesson ${lessonId}`)
  } catch (error) {
    console.error('Processing error:', error)
    
    processingStatus.set(lessonId, {
      ...processingStatus.get(lessonId),
      status: 'failed',
      stage: 'error',
      error: error.message
    })
  }
}
