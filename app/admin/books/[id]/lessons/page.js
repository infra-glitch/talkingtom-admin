'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, PlusCircle, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'

export default function BookLessonsPage() {
  const params = useParams()
  const [book, setBook] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBookAndLessons()
    }
  }, [params.id])

  const fetchBookAndLessons = async () => {
    try {
      setLoading(true)
      
      // Fetch book details
      const bookRes = await fetch(`/api/books/${params.id}`)
      const bookData = await bookRes.json()
      if (bookData.success) {
        setBook(bookData.book)
      }

      // Fetch lessons for this book
      const lessonsRes = await fetch(`/api/lessons?book_id=${params.id}`)
      const lessonsData = await lessonsRes.json()
      if (lessonsData.success) {
        setLessons(lessonsData.lessons || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Book not found</h2>
          <Link href="/admin/books">
            <Button className="mt-4">Back to Books</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/admin/books/${params.id}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Book Details
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
        <p className="text-muted-foreground mt-2">
          {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} in this book
        </p>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          title="No lessons found"
          description="This book doesn't have any lessons yet. Add your first lesson to get started."
          actionLabel="Add Lesson"
          actionHref="/admin/lessons/new"
          icon={FileText}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      Lesson {lesson.lesson_number}
                    </Badge>
                    <CardTitle className="text-lg">{lesson.name}</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {lesson.num_topics || 0} topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/lessons/${lesson.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Status: {lesson.status || 'pending'}</span>
                  {lesson.created_at && (
                    <span>{new Date(lesson.created_at).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
