'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import EmptyState from '@/components/EmptyState'
import { useRouter } from 'next/navigation'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, book: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/books')
      const data = await res.json()
      if (data.success) {
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.book) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/books/${deleteDialog.book.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        setBooks(books.filter(b => b.id !== deleteDialog.book.id))
        setDeleteDialog({ open: false, book: null })
      } else {
        alert('Failed to delete book: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Failed to delete book')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Book Title' },
    { 
      key: 'author', 
      label: 'Author',
      render: (value) => value || '-'
    },
    { key: 'slug', label: 'Slug' },
    { 
      key: 'created_at', 
      label: 'Created At',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
  ]

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground mt-2">
            Manage all books in the system
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <EmptyState
          title="No books found"
          description="Get started by creating your first book"
          actionLabel="Add Book"
          actionHref="/admin/books/new"
          icon={BookOpen}
        />
      ) : (
        <DataTable
          columns={columns}
          data={books}
          viewPath="/admin/books"
          editPath="/admin/books"
          onDelete={(book) => setDeleteDialog({ open: true, book })}
          emptyMessage="No books found"
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, book: null })}
        onConfirm={handleDelete}
        title="Delete Book?"
        description={`Are you sure you want to delete "${deleteDialog.book?.title}"? This will mark it as inactive.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
