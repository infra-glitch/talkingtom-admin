'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function EditGradePage() {
  const params = useParams()
  const router = useRouter()
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
        setGrade(data.grade.grade || '')
      }
    } catch (error) {
      console.error('Error fetching grade:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!grade) {
      alert('Grade is required')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/grades/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade })
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push(`/admin/grades/${params.id}`)
      } else {
        alert('Failed to update grade: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating grade:', error)
      alert('Failed to update grade')
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
      <Link href={`/admin/grades/${params.id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Grade Details
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Grade</CardTitle>
          <CardDescription>Update grade information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Input
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., Grade 1, Grade 2, etc."
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Link href={`/admin/grades/${params.id}`} className="flex-1">
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
