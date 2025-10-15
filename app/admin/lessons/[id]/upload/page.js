'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, Upload, FileText, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function UploadLessonPDF() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id
  
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pdfFile, setPdfFile] = useState(null)

  useEffect(() => {
    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      const res = await fetch('/api/lessons')
      const data = await res.json()
      const currentLesson = data.lessons?.find(l => l.id === parseInt(lessonId))
      setLesson(currentLesson)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      setError('Failed to load lesson details')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        return
      }
      setPdfFile(file)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      setError('')

      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('lessonId', lessonId)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/lessons/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setSuccess(true)

      // Start processing
      await fetch('/api/lessons/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      })

      // Redirect after delay
      setTimeout(() => {
        router.push(`/admin/lessons/${lessonId}/status`)
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload PDF')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Lesson not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload Lesson PDF</CardTitle>
          <CardDescription>
            {lesson.name} - Lesson {lesson.lesson_number}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
              <p className="text-muted-foreground mb-4">
                Processing has started. Redirecting to status page...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>PDF File *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {pdfFile && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-accent">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Info Alert */}
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>What happens next:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>PDF will be uploaded to storage</li>
                    <li>Pages will be extracted as images</li>
                    <li>OCR will extract text (Google Vision)</li>
                    <li>AI will segment content into topics (OpenAI)</li>
                    <li>Audio will be generated (ElevenLabs)</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                className="w-full"
                size="lg"
                disabled={uploading || !pdfFile}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload & Start Processing
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
