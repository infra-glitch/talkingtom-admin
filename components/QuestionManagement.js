'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, HelpCircle, Loader2 } from 'lucide-react'
import QuestionCard from '@/components/QuestionCard'
import QuestionForm from '@/components/QuestionForm'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'

export default function QuestionManagement({ lessonId, initialSections = [] }) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [sectionOrder, setSectionOrder] = useState(1)
  const [savingSection, setSavingSection] = useState(false)
  
  const [selectedSection, setSelectedSection] = useState(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const refreshSections = async () => {
    try {
      // Add a small delay to ensure database transaction completes
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const res = await fetch(`/api/quiz-sections?lesson_id=${lessonId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const data = await res.json()
      if (data.success) {
        // Fetch questions for each section
        const sectionsWithQuestions = await Promise.all(
          data.sections.map(async (section) => {
            const qRes = await fetch(`/api/quiz-questions?section_id=${section.id}`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
              }
            })
            const qData = await qRes.json()
            return {
              ...section,
              questions: qData.success ? qData.questions : []
            }
          })
        )
        setSections(sectionsWithQuestions)
      }
      // Refresh the server component to update counts in header
      router.refresh()
    } catch (error) {
      console.error('Error refreshing sections:', error)
    }
  }

  const handleCreateSection = async () => {
    if (!sectionName || !sectionOrder) {
      alert('Please fill all required fields')
      return
    }

    try {
      setSavingSection(true)
      const res = await fetch('/api/quiz-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          name: sectionName,
          order: parseInt(sectionOrder)
        })
      })

      const data = await res.json()

      if (data.success) {
        await refreshSections()
        setShowSectionDialog(false)
        setSectionName('')
        setSectionOrder(sections.length + 1)
      } else {
        alert('Failed to create section: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating section:', error)
      alert('Failed to create section')
    } finally {
      setSavingSection(false)
    }
  }

  const handleDeleteSection = async () => {
    if (!deleteDialog.item) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/quiz-sections/${deleteDialog.item.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        await refreshSections()
        setDeleteDialog({ open: false, type: null, item: null })
      } else {
        alert('Failed to delete section: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      alert('Failed to delete section')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!deleteDialog.item) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/quiz-questions/${deleteDialog.item.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        await refreshSections()
        setDeleteDialog({ open: false, type: null, item: null })
      } else {
        alert('Failed to delete question: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleQuestionSuccess = async () => {
    await refreshSections()
    setShowQuestionForm(false)
    setEditingQuestion(null)
    setSelectedSection(null)
  }

  const totalQuestions = sections.reduce((sum, section) => 
    sum + (section.questions?.filter(q => q.active).length || 0), 0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Questions Management</h3>
          <p className="text-sm text-muted-foreground">
            {sections.length} section{sections.length !== 1 ? 's' : ''}, {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowSectionDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No sections yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a section to start adding questions
            </p>
            <Button onClick={() => setShowSectionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        sections.map((section) => {
          const activeQuestions = section.questions?.filter(q => q.active) || []
          
          return (
            <div key={section.id}>
              <Card className="mb-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle>{section.name}</CardTitle>
                      <CardDescription>
                        {activeQuestions.length} question{activeQuestions.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Order: {section.order}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSection(section)
                          setShowQuestionForm(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, type: 'section', item: section })}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {activeQuestions.length === 0 ? (
                <Card className="mb-6">
                  <CardContent className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No questions in this section yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 mb-6">
                  {activeQuestions.map((question, qIndex) => (
                    <div key={question.id} className="relative">
                      <QuestionCard
                        question={question}
                        questionNumber={qIndex + 1}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuestion(question)
                            setSelectedSection(section)
                            setShowQuestionForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, type: 'question', item: question })}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Create Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Add a new section to organize your questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-name">Section Name *</Label>
              <Input
                id="section-name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Section 1, Practice Questions"
              />
            </div>
            <div>
              <Label htmlFor="section-order">Order *</Label>
              <Input
                id="section-order"
                type="number"
                value={sectionOrder}
                onChange={(e) => setSectionOrder(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSection} disabled={savingSection}>
                {savingSection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Section
              </Button>
              <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Form Dialog */}
      {showQuestionForm && selectedSection && (
        <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <QuestionForm
              sectionId={selectedSection.id}
              editQuestion={editingQuestion}
              onSuccess={handleQuestionSuccess}
              onCancel={() => {
                setShowQuestionForm(false)
                setEditingQuestion(null)
                setSelectedSection(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, type: null, item: null })}
        onConfirm={deleteDialog.type === 'section' ? handleDeleteSection : handleDeleteQuestion}
        title={`Delete ${deleteDialog.type === 'section' ? 'Section' : 'Question'}?`}
        description={`Are you sure you want to delete this ${deleteDialog.type}? This action will mark it as inactive.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
