'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function EditBookPage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    slug: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
        setFormData({
          title: data.book.title || '',
          author: data.book.author || '',
          slug: data.book.slug || ''
        })
      }
    } catch (error) {
      console.error('Error fetching book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title) {
      alert('Title is required')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/books/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push(`/admin/books/${params.id}`)
      } else {
        alert('Failed to update book: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating book:', error)
      alert('Failed to update book')
    } finally {
      setSaving(false)
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

  return (
    <div className="container py-8 max-w-2xl">
      <Link href={`/admin/books/${params.id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Book Details
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Book</CardTitle>
          <CardDescription>Update book information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Book Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter book title"
                required
              />
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Enter author name"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="URL-friendly identifier"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier (e.g., my-book-title)
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Link href={`/admin/books/${params.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
