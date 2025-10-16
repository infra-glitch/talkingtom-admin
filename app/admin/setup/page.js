'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, School, BookOpen, Library, FileText, Upload } from 'lucide-react'
import Link from 'next/link'

export default function SetupWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Existing data
  const [schools, setSchools] = useState([])
  const [curriculums, setCurriculums] = useState([])
  const [grades, setGrades] = useState([])
  const [books, setBooks] = useState([])
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: School, Curriculum, Grade
    schoolId: '',
    schoolName: '',
    schoolState: '',
    schoolCountry: 'India',
    curriculumId: '',
    curriculumName: '',
    gradeId: '',
    gradeName: '',
    
    // Step 2: Book
    bookId: '',
    bookTitle: '',
    bookAuthor: '',
    
    // Step 3: Subject
    subjectName: '',
    
    // Step 4: Lesson
    lessonNumber: '1',
    lessonName: '',
    
    // Step 5: PDF
    pdfFile: null
  })
  
  const [createdIds, setCreatedIds] = useState({
    schoolId: null,
    curriculumId: null,
    gradeId: null,
    bookId: null,
    subjectId: null,
    lessonId: null
  })

  useEffect(() => {
    fetchExistingData()
  }, [])

  const fetchExistingData = async () => {
    try {
      const [schoolsRes, curriculumsRes, gradesRes, booksRes] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/curriculums'),
        fetch('/api/grades'),
        fetch('/api/books')
      ])

      const schoolsData = await schoolsRes.json()
      const curriculumsData = await curriculumsRes.json()
      const gradesData = await gradesRes.json()
      const booksData = await booksRes.json()

      setSchools(schoolsData.schools || [])
      setCurriculums(curriculumsData.curriculums || [])
      setGrades(gradesData.grades || [])
      setBooks(booksData.books || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleNext = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (step === 1) {
        // Create or select School, Curriculum, Grade
        let schoolId = formData.schoolId
        let curriculumId = formData.curriculumId
        let gradeId = formData.gradeId

        // Create school if new
        if (!schoolId && formData.schoolName) {
          const res = await fetch('/api/schools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.schoolName,
              state: formData.schoolState,
              country: formData.schoolCountry
            })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          schoolId = data.school.id
          setCreatedIds(prev => ({ ...prev, schoolId }))
        }

        // Create curriculum if new
        if (!curriculumId && formData.curriculumName) {
          const res = await fetch('/api/curriculums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.curriculumName,
              country: formData.schoolCountry
            })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          curriculumId = data.curriculum.id
          setCreatedIds(prev => ({ ...prev, curriculumId }))
        }

        // Create grade if new
        if (!gradeId && formData.gradeName) {
          const res = await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade: formData.gradeName })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          gradeId = data.grade.id
          setCreatedIds(prev => ({ ...prev, gradeId }))
        }

        if (!schoolId || !curriculumId || !gradeId) {
          throw new Error('Please provide or select school, curriculum, and grade')
        }

        setFormData(prev => ({
          ...prev,
          schoolId: schoolId.toString(),
          curriculumId: curriculumId.toString(),
          gradeId: gradeId.toString()
        }))
        setSuccess('Step 1 completed!')
        setStep(2)
      } else if (step === 2) {
        // Create or select Book
        let bookId = formData.bookId

        if (!bookId && formData.bookTitle) {
          const res = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.bookTitle,
              author: formData.bookAuthor
            })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          bookId = data.book.id
          setCreatedIds(prev => ({ ...prev, bookId }))
        }

        if (!bookId) {
          throw new Error('Please provide or select a book')
        }

        setFormData(prev => ({ ...prev, bookId: bookId.toString() }))
        setSuccess('Book selected!')
        setStep(3)
      } else if (step === 3) {
        // Create Subject
        if (!formData.subjectName) {
          throw new Error('Please enter subject name')
        }

        const res = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.subjectName,
            school_id: parseInt(formData.schoolId),
            curriculum_id: parseInt(formData.curriculumId),
            grade_id: parseInt(formData.gradeId),
            book_id: parseInt(formData.bookId)
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        setCreatedIds(prev => ({ ...prev, subjectId: data.subject.id }))
        setSuccess('Subject created!')
        setStep(4)
      } else if (step === 4) {
        // Create Lesson
        if (!formData.lessonName || !formData.lessonNumber) {
          throw new Error('Please enter lesson name and number')
        }

        const res = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: parseInt(formData.bookId),
            lesson_number: parseInt(formData.lessonNumber),
            name: formData.lessonName
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        setCreatedIds(prev => ({ ...prev, lessonId: data.lesson.id }))
        setSuccess('Lesson created!')
        setStep(5)
      } else if (step === 5) {
        // Upload PDF
        if (!formData.pdfFile) {
          throw new Error('Please select a PDF file')
        }

        const uploadFormData = new FormData()
        uploadFormData.append('pdf', formData.pdfFile)
        uploadFormData.append('lessonId', createdIds.lessonId.toString())

        const res = await fetch('/api/lessons/upload', {
          method: 'POST',
          body: uploadFormData
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        // Start processing
        await fetch('/api/lessons/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: createdIds.lessonId })
        })

        setSuccess('Setup complete! Redirecting...')
        setTimeout(() => {
          router.push(`/admin/lessons/${createdIds.lessonId}/status`)
        }, 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setError('')
    setSuccess('')
    setStep(step - 1)
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const progress = (step / 5) * 100

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Setup Wizard</CardTitle>
          <CardDescription>
            Create Subject by linking School, Curriculum, Grade & Book - Step {step} of 3
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {/* Step 1: School, Curriculum, Grade */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <School className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Step 1: School, Curriculum & Grade</h3>
              </div>

              {/* School */}
              <div className="space-y-2">
                <Label>School</Label>
                <Select value={formData.schoolId} onValueChange={(v) => updateFormData('schoolId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={schools.length > 0 ? "Select existing school" : "No schools available - create new below"} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.length > 0 ? (
                      schools.map((school) => (
                        <SelectItem key={school.id} value={school.id.toString()}>
                          {school.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No schools available</div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Or create new:</p>
                <Input
                  placeholder="School Name"
                  value={formData.schoolName}
                  onChange={(e) => updateFormData('schoolName', e.target.value)}
                  disabled={!!formData.schoolId}
                />
                <Input
                  placeholder="State"
                  value={formData.schoolState}
                  onChange={(e) => updateFormData('schoolState', e.target.value)}
                  disabled={!!formData.schoolId}
                />
              </div>

              {/* Curriculum */}
              <div className="space-y-2">
                <Label>Curriculum</Label>
                <Select value={formData.curriculumId} onValueChange={(v) => updateFormData('curriculumId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={curriculums.length > 0 ? "Select existing curriculum" : "No curriculums available - create new below"} />
                  </SelectTrigger>
                  <SelectContent>
                    {curriculums.length > 0 ? (
                      curriculums.map((curriculum) => (
                        <SelectItem key={curriculum.id} value={curriculum.id.toString()}>
                          {curriculum.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No curriculums available</div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Or create new:</p>
                <Input
                  placeholder="Curriculum Name (e.g., CBSE, ICSE)"
                  value={formData.curriculumName}
                  onChange={(e) => updateFormData('curriculumName', e.target.value)}
                  disabled={!!formData.curriculumId}
                />
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={formData.gradeId} onValueChange={(v) => updateFormData('gradeId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={grades.length > 0 ? "Select existing grade" : "No grades available - create new below"} />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.length > 0 ? (
                      grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id.toString()}>
                          {grade.grade}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No grades available</div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Or create new:</p>
                <Input
                  placeholder="Grade (e.g., 1, 2, 10)"
                  value={formData.gradeName}
                  onChange={(e) => updateFormData('gradeName', e.target.value)}
                  disabled={!!formData.gradeId}
                />
              </div>
            </div>
          )}

          {/* Step 2: Book */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Step 2: Book</h3>
              </div>

              <div className="space-y-2">
                <Label>Book</Label>
                <Select value={formData.bookId} onValueChange={(v) => updateFormData('bookId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={books.length > 0 ? "Select existing book" : "No books available - create new below"} />
                  </SelectTrigger>
                  <SelectContent>
                    {books.length > 0 ? (
                      books.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.title} {book.author && `- ${book.author}`}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No books available</div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Or create new:</p>
                <Input
                  placeholder="Book Title"
                  value={formData.bookTitle}
                  onChange={(e) => updateFormData('bookTitle', e.target.value)}
                  disabled={!!formData.bookId}
                />
                <Input
                  placeholder="Author (optional)"
                  value={formData.bookAuthor}
                  onChange={(e) => updateFormData('bookAuthor', e.target.value)}
                  disabled={!!formData.bookId}
                />
              </div>
            </div>
          )}

          {/* Step 3: Subject */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Library className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Step 3: Subject</h3>
              </div>

              <Alert>
                <AlertDescription>
                  This will link the School, Curriculum, Grade, and Book together.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Subject Name *</Label>
                <Input
                  placeholder="e.g., Mathematics, Science, English"
                  value={formData.subjectName}
                  onChange={(e) => updateFormData('subjectName', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Lesson */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Step 4: Lesson</h3>
              </div>

              <div className="space-y-2">
                <Label>Lesson Number *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.lessonNumber}
                  onChange={(e) => updateFormData('lessonNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Lesson Name *</Label>
                <Input
                  placeholder="e.g., Introduction to Numbers"
                  value={formData.lessonName}
                  onChange={(e) => updateFormData('lessonName', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 5: PDF Upload */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Step 5: Upload PDF</h3>
              </div>

              <Alert>
                <AlertDescription>
                  Upload the lesson PDF to start the digitization process.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>PDF File *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => updateFormData('pdfFile', e.target.files?.[0] || null)}
                />
                {formData.pdfFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.pdfFile.name} ({(formData.pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : step === 5 ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
