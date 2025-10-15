'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, FileText, Eye, Brain, Mic, Database } from 'lucide-react'

export default function LessonProcessingStatus() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id
  
  const [job, setJob] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!lessonId) return

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [lessonId])

  const fetchStatus = async () => {
    try {
      // Fetch lesson
      const lessonRes = await fetch('/api/lessons')
      const lessonData = await lessonRes.json()
      const currentLesson = lessonData.lessons?.find(l => l.id === lessonId)
      setLesson(currentLesson)

      // Fetch processing job
      const jobRes = await fetch(`/api/lessons/process?lessonId=${lessonId}`)
      if (jobRes.ok) {
        const jobData = await jobRes.json()
        setJob(jobData)

        // Redirect if completed
        if (jobData?.status === 'completed') {
          setTimeout(() => {
            router.push(`/admin/lessons/${lessonId}`)
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStageInfo = (stage) => {
    const stages = {
      queued: { icon: FileText, label: 'Queued', color: 'text-gray-500' },
      starting: { icon: Loader2, label: 'Starting', color: 'text-blue-500' },
      pdf_extraction: { icon: FileText, label: 'Extracting PDF Pages', color: 'text-blue-500' },
      ocr_processing: { icon: Eye, label: 'OCR Processing', color: 'text-purple-500' },
      ai_segmentation: { icon: Brain, label: 'AI Segmentation', color: 'text-green-500' },
      tts_generation: { icon: Mic, label: 'Generating Audio', color: 'text-orange-500' },
      database_save: { icon: Database, label: 'Saving to Database', color: 'text-indigo-500' },
      completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-500' },
      error: { icon: AlertCircle, label: 'Error', color: 'text-red-500' }
    }

    return stages[stage] || stages.queued
  }

  const renderStageProgress = () => {
    const stages = [
      { key: 'pdf_extraction', label: 'PDF Extraction', progress: 20 },
      { key: 'ocr_processing', label: 'OCR Processing', progress: 50 },
      { key: 'ai_segmentation', label: 'AI Segmentation', progress: 70 },
      { key: 'tts_generation', label: 'TTS Generation', progress: 90 },
      { key: 'database_save', label: 'Database Save', progress: 95 },
      { key: 'completed', label: 'Completed', progress: 100 }
    ]

    const currentStageIndex = stages.findIndex(s => s.key === job?.stage)
    
    return (
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isPast = currentStageIndex > index
          const isCurrent = currentStageIndex === index
          const stageInfo = getStageInfo(stage.key)
          const Icon = stageInfo.icon

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isCurrent ? 'bg-primary/5 border-primary' : isPast ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div>
                {isPast ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Icon className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${
                  isCurrent ? 'text-primary' : isPast ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {stage.label}
                </div>
              </div>
              {(isPast || isCurrent) && (
                <Badge variant={isPast ? 'default' : 'secondary'}>
                  {isPast ? 'Done' : 'Processing'}
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const stageInfo = job?.stage ? getStageInfo(job.stage) : null
  const StageIcon = stageInfo?.icon || Loader2

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {lesson?.name || 'Processing Lesson'}
                </CardTitle>
                <CardDescription className="mt-1">
                  Lesson {lesson?.lesson_number}
                </CardDescription>
              </div>
              {job?.status === 'completed' ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              ) : job?.status === 'failed' ? (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Failed
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Processing
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
            <CardDescription>
              {stageInfo?.label || 'Starting...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{job?.progress || 0}%</span>
              </div>
              <Progress value={job?.progress || 0} className="h-3" />
            </div>

            {/* Stage Progress */}
            {job?.stage && job.stage !== 'completed' && job.stage !== 'error' && (
              <div>
                <h4 className="font-medium mb-3">Processing Stages</h4>
                {renderStageProgress()}
              </div>
            )}

            {/* Completed State */}
            {job?.status === 'completed' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Processing completed successfully! Redirecting to lesson details...
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {job?.status === 'failed' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p className="font-medium">Processing failed</p>
                    {job.error && <p className="text-sm mt-1">{job.error}</p>}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Metadata */}
            {job?.metadata && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 text-sm">Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {job.metadata.totalPages && (
                    <div>
                      <span className="text-muted-foreground">Total Pages:</span>
                      <span className="ml-2 font-medium">{job.metadata.totalPages}</span>
                    </div>
                  )}
                  {job.metadata.topicsCount && (
                    <div>
                      <span className="text-muted-foreground">Topics Found:</span>
                      <span className="ml-2 font-medium">{job.metadata.topicsCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What's Happening?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">PDF Page Extraction</div>
                  <div className="text-muted-foreground">Converting PDF pages to images</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Eye className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">OCR Processing</div>
                  <div className="text-muted-foreground">Extracting text and images using Google Vision</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Brain className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">AI Segmentation</div>
                  <div className="text-muted-foreground">Organizing content into topics and subtopics using OpenAI</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Mic className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">Audio Generation</div>
                  <div className="text-muted-foreground">Creating voice narration with ElevenLabs</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Database className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">Database Storage</div>
                  <div className="text-muted-foreground">Saving structured content to Supabase</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
