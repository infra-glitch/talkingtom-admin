'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CurriculumDetailPage() {
  const params = useParams()
  const [curriculum, setCurriculum] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCurriculum()
    }
  }, [params.id])

  const fetchCurriculum = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/curriculums/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setCurriculum(data.curriculum)
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error)
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

  if (!curriculum) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Curriculum not found</h2>
          <Link href="/admin/curriculums">
            <Button className="mt-4">Back to Curriculums</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/curriculums">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Curriculums
          </Button>
        </Link>
        <Link href={`/admin/curriculums/${params.id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Curriculum
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{curriculum.name}</CardTitle>
          <CardDescription>Curriculum Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Curriculum Name</p>
              <p className="text-base">{curriculum.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Country</p>
              <p className="text-base">{curriculum.country || 'India'}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                <p className="text-base">
                  {curriculum.created_at ? new Date(curriculum.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                <p className="text-base">
                  {curriculum.updated_at ? new Date(curriculum.updated_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
