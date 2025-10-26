'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewGradePage() {
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!grade) {
      alert('Grade is required')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade })
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push('/admin/grades')
      } else {
        alert('Failed to create grade: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating grade:', error)
      alert('Failed to create grade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/admin/grades">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Grades
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Grade</CardTitle>
          <CardDescription>Create a new grade in the system</CardDescription>
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
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Grade
              </Button>
              <Link href="/admin/grades" className="flex-1">
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
