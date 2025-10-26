'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewSubjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    school_id: '',
    curriculum_id: '',
    grade_id: '',
    book_id: ''
  })
  const [schools, setSchools] = useState([])
  const [curriculums, setCurriculums] = useState([])
  const [grades, setGrades] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMasterData()
  }, [])

  const fetchMasterData = async () => {
    try {
      setLoading(true)
      
      const [schoolsRes, curriculumsRes, gradesRes, booksRes] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/curriculums'),
        fetch('/api/grades'),
        fetch('/api/books')
      ])

      const [schoolsData, curriculumsData, gradesData, booksData] = await Promise.all([
        schoolsRes.json(),
        curriculumsRes.json(),
        gradesRes.json(),
        booksRes.json()
      ])

      if (schoolsData.success) setSchools(schoolsData.schools || [])
      if (curriculumsData.success) setCurriculums(curriculumsData.curriculums || [])
      if (gradesData.success) setGrades(gradesData.grades || [])
      if (booksData.success) setBooks(booksData.books || [])
    } catch (error) {
      console.error('Error fetching master data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.school_id || !formData.curriculum_id || !formData.grade_id || !formData.book_id) {
      alert('All fields are required')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push('/admin/subjects')
      } else {
        alert('Failed to create subject: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating subject:', error)
      alert('Failed to create subject')
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
      <Link href="/admin/subjects">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subjects
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Subject</CardTitle>
          <CardDescription>Create a new subject with required mappings</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All fields are required. Subjects must be mapped to a book.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics, Science, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="school">School *</Label>
              <Select
                value={formData.school_id}
                onValueChange={(value) => setFormData({ ...formData, school_id: value })}
              >
                <SelectTrigger id="school">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="curriculum">Curriculum *</Label>
              <Select
                value={formData.curriculum_id}
                onValueChange={(value) => setFormData({ ...formData, curriculum_id: value })}
              >
                <SelectTrigger id="curriculum">
                  <SelectValue placeholder="Select a curriculum" />
                </SelectTrigger>
                <SelectContent>
                  {curriculums.map((curriculum) => (
                    <SelectItem key={curriculum.id} value={curriculum.id}>
                      {curriculum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Select
                value={formData.grade_id}
                onValueChange={(value) => setFormData({ ...formData, grade_id: value })}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="book">Book *</Label>
              <Select
                value={formData.book_id}
                onValueChange={(value) => setFormData({ ...formData, book_id: value })}
              >
                <SelectTrigger id="book">
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Subject
              </Button>
              <Link href="/admin/subjects" className="flex-1">
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
