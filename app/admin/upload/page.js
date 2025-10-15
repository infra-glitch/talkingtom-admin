'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Loader2, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function UploadLesson() {
  const router = useRouter()
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState('')
  const [lessonNumber, setLessonNumber] = useState('')
  const [lessonName, setLessonName] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [lessonId, setLessonId] = useState(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books')
      const data = await res.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB')
        return
      }
      setPdfFile(file)
      setError('')
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      setPdfFile(file)
      setError('')
    }
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedBook || !lessonNumber || !lessonName || !pdfFile) {
      setError('Please fill in all fields and select a PDF file')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('bookId', selectedBook)
      formData.append('lessonNumber', lessonNumber)
      formData.append('lessonName', lessonName)

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
      setLessonId(data.lessonId)

      // Start processing
      await fetch('/api/lessons/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: data.lessonId })
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/admin/lessons/${data.lessonId}/status`)
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload PDF')
    } finally {
      setUploading(false)
    }
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
            Upload a PDF containing lesson pages for digitization. The system will extract text, 
            images, generate topics, and create audio content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
              <p className="text-muted-foreground mb-4">
                Your lesson PDF has been uploaded and processing has started.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Redirecting to processing status...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Book Selection */}
              <div className="space-y-2">
                <Label htmlFor="book">Book *</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {books.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No books available. Please create a book first.
                  </p>
                )}
              </div>

              {/* Lesson Number */}
              <div className="space-y-2">
                <Label htmlFor="lessonNumber">Lesson Number *</Label>
                <Input
                  id="lessonNumber"
                  type="number"
                  min="1"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(e.target.value)}
                  placeholder="e.g., 1"
                  disabled={uploading}
                />
              </div>

              {/* Lesson Name */}
              <div className="space-y-2">
                <Label htmlFor="lessonName">Lesson Name *</Label>
                <Input
                  id="lessonName"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="e.g., Introduction to Mathematics"
                  disabled={uploading}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>PDF File *</Label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    pdfFile ? 'border-green-500 bg-green-50' : 'border-border hover:border-primary'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdfInput"
                    disabled={uploading}
                  />
                  <label htmlFor="pdfInput" className="cursor-pointer">
                    {pdfFile ? (
                      <div>
                        <FileText className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="font-medium text-green-700">{pdfFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        {!uploading && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Click or drag to replace
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium">Drag & drop PDF here</p>
                        <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-2">Max file size: 50MB</p>
                      </div>
                    )}
                  </label>
                </div>
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
                  <strong>Processing Pipeline:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Extract page images from PDF</li>
                    <li>OCR text and image extraction (Google Vision)</li>
                    <li>AI content segmentation into topics (OpenAI)</li>
                    <li>Generate audio for each segment (ElevenLabs)</li>
                    <li>Save structured content to database</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={uploading || !selectedBook || !lessonNumber || !lessonName || !pdfFile}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload & Process
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
