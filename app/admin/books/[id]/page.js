'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Loader2, BookOpen, List } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function BookDetailPage() {
  const params = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBook()
    }
  }, [params.id])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/books/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setBook(data.book)
      }
    } catch (error) {
      console.error('Error fetching book:', error)
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
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/books">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/admin/books/${params.id}/lessons`}>
            <Button variant="outline">
              <List className="h-4 w-4 mr-2" />
              View Lessons
            </Button>
          </Link>
          <Link href={`/admin/books/${params.id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Book
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            {book.title}
          </CardTitle>
          <CardDescription>Book Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Book Title</p>
              <p className="text-base">{book.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Author</p>
              <p className="text-base">{book.author || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Slug</p>
              <p className="text-base font-mono text-sm">{book.slug || '-'}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                <p className="text-base">
                  {book.created_at ? new Date(book.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                <p className="text-base">
                  {book.updated_at ? new Date(book.updated_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
