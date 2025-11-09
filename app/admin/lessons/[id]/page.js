import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, BookOpen, FileText, Volume2, HelpCircle, CheckCircle } from 'lucide-react'
import TopicCard from '@/components/TopicCard'
import QuestionCard from '@/components/QuestionCard'
import QuestionManagement from '@/components/QuestionManagement'

export default async function LessonDetailPage({ params }) {
  const supabase = createClient()
  const lessonId = parseInt(params.id)

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch lesson details
  const { data: lesson, error: lessonError } = await supabase
    .from('lesson')
    .select(`
      *,
      book:book_id(*)
    `)
    .eq('id', lessonId)
    .single()

  if (lessonError || !lesson) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lesson not found</p>
          <Link href="/admin">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Fetch lesson topics
  const { data: topics, error: topicsError } = await supabase
    .from('lesson_topic')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('active', true)
    .order('order', { ascending: true })

  // Fetch quiz sections and questions
  const { data: quizSections, error: sectionsError } = await supabase
    .from('quiz_section')
    .select(`
      *,
      questions:quiz_question(
        id,
        question_type,
        question,
        active,
        created_at
      )
    `)
    .eq('lesson_id', lessonId)
    .eq('active', true)
    .order('order', { ascending: true })

  const allTopics = topics || []
  const allQuizSections = quizSections || []
  const totalQuestions = allQuizSections.reduce((sum, section) => 
    sum + (section.questions?.filter(q => q.active).length || 0), 0
  )

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Lesson Info */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge>Lesson {lesson.lesson_number}</Badge>
              {lesson.thumbnail && <Badge variant="secondary">PDF Uploaded</Badge>}
            </div>
            <h1 className="text-3xl font-bold mb-2">{lesson.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{lesson.book?.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{allTopics.length} Topics</span>
              </div>
              <div className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                <span>{totalQuestions} Questions</span>
              </div>
            </div>
          </div>
          {!lesson.thumbnail && (
            <Link href={`/admin/lessons/${lessonId}/upload`}>
              <Button>
                Upload PDF
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="topics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="topics">
            <FileText className="h-4 w-4 mr-2" />
            Topics ({allTopics.length})
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions ({totalQuestions})
          </TabsTrigger>
        </TabsList>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-6">
          {allTopics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No topics yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload a PDF to automatically extract and create topics
                </p>
              </CardContent>
            </Card>
          ) : (
            allTopics.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} />
            ))
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          {allQuizSections.length === 0 || totalQuestions === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No questions yet</p>
                <p className="text-sm text-muted-foreground">
                  Questions will be generated after processing the lesson
                </p>
              </CardContent>
            </Card>
          ) : (
            allQuizSections.map((section) => {
              const activeQuestions = section.questions?.filter(q => q.active) || []
              if (activeQuestions.length === 0) return null

              return (
                <div key={section.id}>
                  <Card className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{section.name}</CardTitle>
                          <CardDescription>
                            {activeQuestions.length} question{activeQuestions.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        <Badge>{section.order}</Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="space-y-4">
                    {activeQuestions.map((question, qIndex) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        questionNumber={qIndex + 1}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
