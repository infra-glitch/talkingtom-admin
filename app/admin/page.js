'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, School, BookOpen, Library, FileText } from 'lucide-react'

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

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      const [schools, curriculums, grades, subjects, books, lessons] = await Promise.all([
        fetch('/api/schools').then(r => r.json()),
        fetch('/api/curriculums').then(r => r.json()),
        fetch('/api/grades').then(r => r.json()),
        fetch('/api/subjects').then(r => r.json()),
        fetch('/api/books').then(r => r.json()),
        fetch('/api/lessons').then(r => r.json())
      ])

      setData({
        schools: schools.schools || [],
        curriculums: curriculums.curriculums || [],
        grades: grades.grades || [],
        subjects: subjects.subjects || [],
        books: books.books || [],
        lessons: lessons.lessons || []
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
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
            Manage schools, curriculum, books, and lessons
          </p>
        </div>
        <Link href="/admin/setup">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Complete Setup
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.schools.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.books.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.subjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lessons.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Guide */}
      {data.schools.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Get Started</CardTitle>
            <CardDescription>
              Two-step process for lesson digitization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Part 1: Setup (One-time per Subject)</h4>
                <ol className="list-decimal ml-6 space-y-1 text-sm">
                  <li>Create School, Curriculum, and Grade</li>
                  <li>Create Book</li>
                  <li>Create Subject (links School + Curriculum + Grade + Book)</li>
                </ol>
                <Link href="/admin/setup">
                  <Button className="mt-3">
                    <Plus className="mr-2 h-4 w-4" />
                    Start Setup Wizard
                  </Button>
                </Link>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Part 2: Add Lessons (Repeatable)</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  After setup, add lessons for any book and upload PDFs
                </p>
                <Link href="/admin/lessons/new">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Add New Lesson
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Actions for existing users */}
      {data.schools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Link href="/admin/setup">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Subject
                </Button>
              </Link>
              <Link href="/admin/lessons/new">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Lesson
                </Button>
              </Link>
              <Link href="/admin/books/new">
                <Button variant="outline" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  New Book
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Lessons</CardTitle>
            <CardDescription>Latest lessons added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No lessons yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.lessons.slice(0, 5).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{lesson.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Lesson {lesson.lesson_number}
                      </div>
                    </div>
                    {lesson.thumbnail ? (
                      <Badge variant="default" className="text-xs">PDF Ready</Badge>
                    ) : (
                      <Link href={`/admin/lessons/${lesson.id}/upload`}>
                        <Button variant="outline" size="sm">Upload PDF</Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Books</CardTitle>
            <CardDescription>All books in your library</CardDescription>
          </CardHeader>
          <CardContent>
            {data.books.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No books yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.books.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{book.title}</div>
                      {book.author && (
                        <div className="text-xs text-muted-foreground">{book.author}</div>
                      )}
                    </div>
                    <Badge variant="outline">
                      {data.lessons.filter(l => l.book_id === book.id).length} lessons
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
