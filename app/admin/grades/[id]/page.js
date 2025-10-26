'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function GradeDetailPage() {
  const params = useParams()
  const [grade, setGrade] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchGrade()
    }
  }, [params.id])

  const fetchGrade = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/grades/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setGrade(data.grade)
      }
    } catch (error) {
      console.error('Error fetching grade:', error)
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

  if (!grade) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Grade not found</h2>
          <Link href="/admin/grades">
            <Button className="mt-4">Back to Grades</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/grades">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Grades
          </Button>
        </Link>
        <Link href={`/admin/grades/${params.id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Grade
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{grade.grade}</CardTitle>
          <CardDescription>Grade Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Grade</p>
              <p className="text-base">{grade.grade}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              <p className="text-base">{grade.active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                <p className="text-base">
                  {grade.created_at ? new Date(grade.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                <p className="text-base">
                  {grade.updated_at ? new Date(grade.updated_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
