'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function SubjectDetailPage() {
  const params = useParams()
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSubject()
    }
  }, [params.id])

  const fetchSubject = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/subjects/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setSubject(data.subject)
      }
    } catch (error) {
      console.error('Error fetching subject:', error)
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

  if (!subject) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Subject not found</h2>
          <Link href="/admin/subjects">
            <Button className="mt-4">Back to Subjects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/subjects">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
        </Link>
        <Link href={`/admin/subjects/${params.id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Subject
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{subject.name}</CardTitle>
          <CardDescription>Subject Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Subject Name</p>
              <p className="text-base">{subject.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">School</p>
              <p className="text-base">{subject.school?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Curriculum</p>
              <p className="text-base">{subject.curriculum?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Grade</p>
              <p className="text-base">{subject.grade?.grade || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground mb-1">Book</p>
              <p className="text-base">{subject.book?.title || '-'}</p>
              {subject.book && (
                <Link href={`/admin/books/${subject.book_id}`}>
                  <Button variant="link" className="p-0 h-auto text-xs mt-1">
                    View Book Details
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                <p className="text-base">
                  {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                <p className="text-base">
                  {subject.updated_at ? new Date(subject.updated_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
