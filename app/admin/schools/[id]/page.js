'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function SchoolDetailPage() {
  const params = useParams()
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSchool()
    }
  }, [params.id])

  const fetchSchool = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/schools/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setSchool(data.school)
      }
    } catch (error) {
      console.error('Error fetching school:', error)
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

  if (!school) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">School not found</h2>
          <Link href="/admin/schools">
            <Button className="mt-4">Back to Schools</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/schools">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schools
          </Button>
        </Link>
        <Link href={`/admin/schools/${params.id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit School
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{school.name}</CardTitle>
          <CardDescription>School Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">School Name</p>
              <p className="text-base">{school.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">State</p>
              <p className="text-base">{school.state}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Country</p>
              <p className="text-base">{school.country || 'India'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
              <p className="text-base">{school.address || '-'}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                <p className="text-base">
                  {school.created_at ? new Date(school.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                <p className="text-base">
                  {school.updated_at ? new Date(school.updated_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
