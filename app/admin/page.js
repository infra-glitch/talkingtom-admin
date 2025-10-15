'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, School, BookOpen, GraduationCap, Library, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    schools: [],
    curriculums: [],
    grades: [],
    subjects: [],
    books: [],
    lessons: []
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch books
      const booksRes = await fetch('/api/books')
      const booksData = await booksRes.json()
      setBooks(booksData.books || [])

      // Fetch lessons
      const lessonsRes = await fetch('/api/lessons')
      const lessonsData = await lessonsRes.json()
      const lessonsList = lessonsData.lessons || []
      setLessons(lessonsList)

      // Calculate stats
      const stats = {
        total: lessonsList.length,
        completed: lessonsList.filter(l => l.status === 'completed').length,
        processing: lessonsList.filter(l => l.status === 'processing').length,
        pending: lessonsList.filter(l => l.status === 'pending' || l.status === 'uploaded').length
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline',
      uploaded: 'outline'
    }

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lesson Digitization Admin</h1>
          <p className="text-muted-foreground mt-1">
            Manage PDF uploads and digitization pipeline
          </p>
        </div>
        <Link href="/admin/upload">
          <Button size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Upload New Lesson
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Loader2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Books Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Books</CardTitle>
              <CardDescription>Manage your book collection</CardDescription>
            </div>
            <Link href="/admin/books/new">
              <Button variant="outline">
                <Book className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No books yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    {book.grade && (
                      <CardDescription>
                        Grade {book.grade} • {book.subject}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {lessons.filter(l => l.book_id === book.id).length} lessons
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Lessons</CardTitle>
          <CardDescription>All uploaded lessons and their processing status</CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No lessons yet</p>
              <p className="text-sm mb-4">Upload your first lesson PDF to get started</p>
              <Link href="/admin/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Lesson
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(lesson.status)}
                    <div className="flex-1">
                      <div className="font-medium">{lesson.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Lesson {lesson.lesson_number}
                        {lesson.num_topics > 0 && ` • ${lesson.num_topics} topics`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(lesson.status)}
                    {(lesson.status === 'processing' || lesson.status === 'uploaded') && (
                      <Link href={`/admin/lessons/${lesson.id}/status`}>
                        <Button variant="outline" size="sm">
                          View Progress
                        </Button>
                      </Link>
                    )}
                    {lesson.status === 'completed' && (
                      <Link href={`/admin/lessons/${lesson.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
