'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, FileText, CheckCircle } from 'lucide-react'

export default function AddLesson() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    bookId: '',
    lessonNumber: '',
    lessonName: ''
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.bookId || !formData.lessonNumber || !formData.lessonName) {
        throw new Error('Please fill in all fields')
      }

      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: parseInt(formData.bookId),
          lesson_number: parseInt(formData.lessonNumber),
          name: formData.lessonName
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess(true)
      
      // Redirect to upload page
      setTimeout(() => {
        router.push(`/admin/lessons/${data.lesson.id}/upload`)
      }, 1500)
    } catch (error) {
      console.error('Error creating lesson:', error)
      setError(error.message || 'Failed to create lesson')
    } finally {
      setLoading(false)
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
          <CardTitle className="text-2xl">Add New Lesson</CardTitle>
          <CardDescription>
            Create a lesson for an existing book. You can add multiple lessons to the same book.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lesson Created!</h3>
              <p className="text-muted-foreground mb-4">
                Redirecting to PDF upload...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Book Selection */}
              <div className="space-y-2">
                <Label htmlFor="book">Book *</Label>
                <Select 
                  value={formData.bookId} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, bookId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={books.length > 0 ? "Select a book" : "No books available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {books.length > 0 ? (
                      books.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.title} {book.author && `by ${book.author}`}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No books available</div>
                    )}
                  </SelectContent>
                </Select>
                {books.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Please create a book first using the Setup Wizard
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
                  placeholder="e.g., 1"
                  value={formData.lessonNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessonNumber: e.target.value }))}
                  disabled={loading}
                />
              </div>

              {/* Lesson Name */}
              <div className="space-y-2">
                <Label htmlFor="lessonName">Lesson Name *</Label>
                <Input
                  id="lessonName"
                  placeholder="e.g., Introduction to Numbers"
                  value={formData.lessonName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessonName: e.target.value }))}
                  disabled={loading}
                />
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Info Alert */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Next step:</strong> After creating the lesson, you'll be able to upload the PDF file for digitization.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !formData.bookId || !formData.lessonNumber || !formData.lessonName}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Lesson...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Create Lesson
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
