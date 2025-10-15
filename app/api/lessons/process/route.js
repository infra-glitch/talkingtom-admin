import { NextResponse } from 'next/server'
import { db, storage } from '@/lib/supabase'
import pdfProcessor from '@/lib/services/pdfProcessor'
import ocrService from '@/lib/services/ocrService'
import aiSegmentation from '@/lib/services/aiSegmentation'
import ttsService from '@/lib/services/ttsService'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Main processing pipeline for lesson PDFs
 * Stages:
 * 1. Extract page images from PDF
 * 2. OCR each page (Google Vision)
 * 3. AI segmentation (OpenAI)
 * 4. Generate audio (ElevenLabs)
 * 5. Save to database
 */
export async function POST(request) {
  try {
    const { lessonId, jobId } = await request.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Get lesson details
    const lessons = await db.getLessons()
    const lesson = lessons.find(l => l.id === lessonId)
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Get or create processing job
    let job
    if (jobId) {
      job = await db.getProcessingJob(jobId)
    } else {
      job = await db.createProcessingJob({
        id: uuidv4(),
        lesson_id: lessonId,
        status: 'processing',
        stage: 'starting',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    // Start processing in background (in production, use a queue system)
    processLesson(lessonId, job.id).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Processing started',
      jobId: job.id
    })
  } catch (error) {
    console.error('Process initiation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start processing' },
      { status: 500 }
    )
  }
}

/**
 * Background processing function
 */
async function processLesson(lessonId, jobId) {
  try {
    console.log(`Starting processing for lesson ${lessonId}...`)

    // Stage 1: Extract page images from PDF
    await db.updateProcessingJob(jobId, {
      stage: 'pdf_extraction',
      progress: 10,
      updated_at: new Date().toISOString()
    })

    console.log('Stage 1: PDF Extraction')
    // In production, fetch the PDF from storage and process it
    const pages = await pdfProcessor.extractPageImages(null) // Mock for now
    
    await db.updateProcessingJob(jobId, {
      stage: 'pdf_extraction',
      progress: 20,
      metadata: { totalPages: pages.length },
      updated_at: new Date().toISOString()
    })

    // Stage 2: OCR Processing
    await db.updateProcessingJob(jobId, {
      stage: 'ocr_processing',
      progress: 30,
      updated_at: new Date().toISOString()
    })

    console.log('Stage 2: OCR Processing')
    const ocrResults = await ocrService.batchProcessPages(pages)
    const fullText = ocrResults.map(r => r.fullText).join('\n\n')

    await db.updateProcessingJob(jobId, {
      stage: 'ocr_processing',
      progress: 50,
      updated_at: new Date().toISOString()
    })

    // Stage 3: AI Segmentation
    await db.updateProcessingJob(jobId, {
      stage: 'ai_segmentation',
      progress: 60,
      updated_at: new Date().toISOString()
    })

    console.log('Stage 3: AI Segmentation')
    let topics = await aiSegmentation.segmentLessonContent(fullText, ocrResults)
    
    // Map images to segments
    const allDetectedImages = ocrResults.flatMap(r => r.detectedImages || [])
    topics = await aiSegmentation.mapImagesToSegments(topics, allDetectedImages)

    await db.updateProcessingJob(jobId, {
      stage: 'ai_segmentation',
      progress: 70,
      metadata: { topicsCount: topics.length },
      updated_at: new Date().toISOString()
    })

    // Stage 4: Generate Audio (TTS)
    await db.updateProcessingJob(jobId, {
      stage: 'tts_generation',
      progress: 75,
      updated_at: new Date().toISOString()
    })

    console.log('Stage 4: TTS Generation')
    for (const topic of topics) {
      for (const segment of topic.simplifiedExplanation) {
        const audio = await ttsService.generateAudio(segment.text, segment.id)
        
        // In production, upload audio to storage and get URL
        segment.audioSrcUrl = `https://storage.example.com/audio/${segment.id}.mp3`
        
        // Simulated upload to storage
        // await storage.uploadAudio(audio.audioBuffer, lessonId, segment.id)
        // segment.audioSrcUrl = storage.getPublicUrl('lesson-audio', `lessons/${lessonId}/audio/${segment.id}.mp3`)
      }
    }

    await db.updateProcessingJob(jobId, {
      stage: 'tts_generation',
      progress: 90,
      updated_at: new Date().toISOString()
    })

    // Stage 5: Save to Database
    await db.updateProcessingJob(jobId, {
      stage: 'database_save',
      progress: 95,
      updated_at: new Date().toISOString()
    })

    console.log('Stage 5: Saving to Database')
    
    // Save each topic to database
    for (const topic of topics) {
      const topicData = {
        id: uuidv4(),
        lesson_id: lessonId,
        topic_id: topic.topicId,
        topic: topic.topic,
        subtopic: topic.subtopic,
        order: topic.order,
        simplified_explanation: topic.simplifiedExplanation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await db.createLessonTopic(topicData)
    }

    // Update lesson
    await db.updateLesson(lessonId, {
      num_topics: topics.length,
      status: 'completed',
      updated_at: new Date().toISOString()
    })

    // Mark job as complete
    await db.updateProcessingJob(jobId, {
      status: 'completed',
      stage: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    console.log(`Processing completed for lesson ${lessonId}`)
  } catch (error) {
    console.error('Processing error:', error)
    
    // Mark job as failed
    await db.updateProcessingJob(jobId, {
      status: 'failed',
      stage: 'error',
      error: error.message,
      updated_at: new Date().toISOString()
    })
  }
}

// Get processing status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const lessonId = searchParams.get('lessonId')

    if (jobId) {
      const job = await db.getProcessingJob(jobId)
      return NextResponse.json(job)
    }

    if (lessonId) {
      // Get all jobs for this lesson
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (error) throw error
      
      return NextResponse.json(data[0] || null)
    }

    return NextResponse.json(
      { error: 'jobId or lessonId required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    )
  }
}
