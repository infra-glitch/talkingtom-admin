'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Loader2 } from 'lucide-react'

const QUESTION_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'BLANKS', label: 'Fill in the Blanks' },
  { value: 'SHORT', label: 'Short Answer' },
  { value: 'LONG', label: 'Long Answer' },
  { value: 'MATCHING', label: 'Matching' },
  { value: 'IDENTIFY', label: 'Identify' },
]

export default function QuestionForm({ sectionId, onSuccess, onCancel, editQuestion = null }) {
  const [questionType, setQuestionType] = useState(editQuestion?.question_type || '')
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState(1)

  // MCQ State
  const [mcqText, setMcqText] = useState('')
  const [mcqOptions, setMcqOptions] = useState([{ id: '1', value: '' }])
  const [mcqAnswer, setMcqAnswer] = useState('')
  const [mcqTopicRefs, setMcqTopicRefs] = useState('')

  // BLANKS State
  const [blanksText, setBlanksText] = useState('')
  const [blanksAnswers, setBlanksAnswers] = useState([''])
  const [blanksTopicRefs, setBlanksTopicRefs] = useState('')

  // SHORT/LONG State
  const [textQuestionText, setTextQuestionText] = useState('')
  const [textAnswer, setTextAnswer] = useState('')
  const [textTopicRefs, setTextTopicRefs] = useState('')

  // MATCHING State
  const [matchingText, setMatchingText] = useState('')
  const [leftItems, setLeftItems] = useState([{ id: '1', value: '', color: '#3b82f6' }])
  const [rightItems, setRightItems] = useState([{ id: '1', value: '' }])
  const [matchingAnswers, setMatchingAnswers] = useState({})

  // IDENTIFY State
  const [identifyText, setIdentifyText] = useState('')
  const [identifyAnswer, setIdentifyAnswer] = useState('')
  const [identifyTopicRefs, setIdentifyTopicRefs] = useState('')

  // Hints State (shared across all question types)
  const [hintText, setHintText] = useState('')
  const [topicPills, setTopicPills] = useState([''])
  const [keywordPills, setKeywordPills] = useState([''])

  useEffect(() => {
    if (editQuestion) {
      loadEditData(editQuestion)
    }
  }, [editQuestion])

  const loadEditData = (question) => {
    const data = question.question
    const type = question.question_type

    setQuestionType(type)
    setOrder(question.order || 1)

    // Load hints if present (common for all question types)
    if (data.hints) {
      setHintText(data.hints.hint_text || '')
      setTopicPills(data.hints.topic_pills && data.hints.topic_pills.length > 0 ? data.hints.topic_pills : [''])
      setKeywordPills(data.hints.keyword_pills && data.hints.keyword_pills.length > 0 ? data.hints.keyword_pills : [''])
    }

    switch (type) {
      case 'MCQ':
        setMcqText(data.question?.text || '')
        setMcqOptions(data.question?.options || [])
        setMcqAnswer(data.answer || '')
        setMcqTopicRefs(data.question?.topic_references?.join(', ') || '')
        break
      case 'BLANKS':
        setBlanksText(data.question?.text || '')
        setBlanksAnswers(data.answer || [''])
        setBlanksTopicRefs(data.topicReferences?.join(', ') || '')
        break
      case 'SHORT':
      case 'LONG':
        setTextQuestionText(data.question?.text || '')
        setTextAnswer(data.answer || '')
        setTextTopicRefs(data.topic_references?.join(', ') || '')
        break
      case 'MATCHING':
        setMatchingText(data.question?.text || '')
        setLeftItems(data.question?.leftItems || [])
        setRightItems(data.question?.rightItems || [])
        setMatchingAnswers(data.answer || {})
        break
      case 'IDENTIFY':
        setIdentifyText(data.question?.text || '')
        setIdentifyAnswer(data.answer || '')
        setIdentifyTopicRefs(data.topicReferences?.join(', ') || '')
        break
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    let questionData = {}
    let answerData = null

    switch (questionType) {
      case 'MCQ':
        if (!mcqText || mcqOptions.length < 2 || !mcqAnswer) {
          alert('Please fill all required fields for MCQ')
          return
        }
        questionData = {
          question: {
            text: mcqText,
            options: mcqOptions.filter(opt => opt.value.trim()),
            topic_references: mcqTopicRefs.split(',').map(t => t.trim()).filter(Boolean)
          },
          answer: mcqAnswer
        }
        break

      case 'BLANKS':
        if (!blanksText || blanksAnswers.length === 0) {
          alert('Please fill all required fields for Fill in the Blanks')
          return
        }
        const filteredAnswers = blanksAnswers.filter(a => a.trim())
        questionData = {
          question: {
            text: blanksText,
            blanks: filteredAnswers.length
          },
          answer: filteredAnswers,
          topicReferences: blanksTopicRefs.split(',').map(t => t.trim()).filter(Boolean)
        }
        break

      case 'SHORT':
      case 'LONG':
        if (!textQuestionText || !textAnswer) {
          alert('Please fill all required fields')
          return
        }
        questionData = {
          question: {
            text: textQuestionText
          },
          answer: textAnswer,
          topic_references: textTopicRefs.split(',').map(t => t.trim()).filter(Boolean)
        }
        break

      case 'MATCHING':
        if (!matchingText || leftItems.length === 0 || rightItems.length === 0) {
          alert('Please fill all required fields for Matching')
          return
        }
        questionData = {
          question: {
            text: matchingText,
            leftItems: leftItems.filter(item => item.value.trim()),
            rightItems: rightItems.filter(item => item.value.trim())
          },
          answer: matchingAnswers
        }
        break

      case 'IDENTIFY':
        if (!identifyText || !identifyAnswer) {
          alert('Please fill all required fields for Identify')
          return
        }
        questionData = {
          question: {
            text: identifyText
          },
          answer: identifyAnswer,
          topicReferences: identifyTopicRefs.split(',').map(t => t.trim()).filter(Boolean)
        }
        break

      default:
        alert('Please select a question type')
        return
    }

    // Add hints if any field is provided
    if (hintText || topicPills.some(p => p.trim()) || keywordPills.some(p => p.trim())) {
      questionData.hints = {
        hint_text: hintText,
        topic_pills: topicPills.filter(p => p.trim()),
        keyword_pills: keywordPills.filter(p => p.trim())
      }
    }

    try {
      setSaving(true)
      const url = editQuestion 
        ? `/api/quiz-questions/${editQuestion.id}`
        : '/api/quiz-questions'
      
      const method = editQuestion ? 'PUT' : 'POST'
      
      const payload = editQuestion
        ? { question_type: questionType, question: questionData, order: parseInt(order) }
        : { section_id: sectionId, question_type: questionType, question: questionData, order: parseInt(order) }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        console.log('Question saved successfully, calling onSuccess()')
        onSuccess()
      } else {
        alert('Failed to save question: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  const renderMCQForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="mcq-text">Question Text *</Label>
        <Textarea
          id="mcq-text"
          value={mcqText}
          onChange={(e) => setMcqText(e.target.value)}
          placeholder="Enter the question"
          rows={3}
        />
      </div>

      <div>
        <Label>Options *</Label>
        <div className="space-y-2 mt-2">
          {mcqOptions.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <Input
                value={option.value}
                onChange={(e) => {
                  const newOptions = [...mcqOptions]
                  newOptions[index].value = e.target.value
                  setMcqOptions(newOptions)
                }}
                placeholder={`Option ${index + 1}`}
              />
              {mcqOptions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMcqOptions(mcqOptions.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMcqOptions([...mcqOptions, { id: String(mcqOptions.length + 1), value: '' }])}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      <div>
        <Label htmlFor="mcq-answer">Correct Answer (Option ID) *</Label>
        <Select value={mcqAnswer} onValueChange={setMcqAnswer}>
          <SelectTrigger>
            <SelectValue placeholder="Select correct option" />
          </SelectTrigger>
          <SelectContent>
            {mcqOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                Option {option.id}: {option.value || '(empty)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="mcq-refs">Topic References (comma separated)</Label>
        <Input
          id="mcq-refs"
          value={mcqTopicRefs}
          onChange={(e) => setMcqTopicRefs(e.target.value)}
          placeholder="e.g., Topic 1, Topic 2"
        />
      </div>
    </div>
  )

  const renderBlanksForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="blanks-text">Question Text (use _____ for blanks) *</Label>
        <Textarea
          id="blanks-text"
          value={blanksText}
          onChange={(e) => setBlanksText(e.target.value)}
          placeholder="Enter the question with _____ for blanks"
          rows={3}
        />
      </div>

      <div>
        <Label>Answers *</Label>
        <div className="space-y-2 mt-2">
          {blanksAnswers.map((answer, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={answer}
                onChange={(e) => {
                  const newAnswers = [...blanksAnswers]
                  newAnswers[index] = e.target.value
                  setBlanksAnswers(newAnswers)
                }}
                placeholder={`Answer ${index + 1}`}
              />
              {blanksAnswers.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setBlanksAnswers(blanksAnswers.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setBlanksAnswers([...blanksAnswers, ''])}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Answer
        </Button>
      </div>

      <div>
        <Label htmlFor="blanks-refs">Topic References (comma separated)</Label>
        <Input
          id="blanks-refs"
          value={blanksTopicRefs}
          onChange={(e) => setBlanksTopicRefs(e.target.value)}
          placeholder="e.g., Topic 1, Topic 2"
        />
      </div>
    </div>
  )

  const renderTextForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-question">Question Text *</Label>
        <Textarea
          id="text-question"
          value={textQuestionText}
          onChange={(e) => setTextQuestionText(e.target.value)}
          placeholder="Enter the question"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="text-answer">Expected Answer *</Label>
        <Textarea
          id="text-answer"
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Enter the expected answer"
          rows={questionType === 'LONG' ? 6 : 3}
        />
      </div>

      <div>
        <Label htmlFor="text-refs">Topic References (comma separated)</Label>
        <Input
          id="text-refs"
          value={textTopicRefs}
          onChange={(e) => setTextTopicRefs(e.target.value)}
          placeholder="e.g., Topic 1, Topic 2"
        />
      </div>
    </div>
  )

  const renderMatchingForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="matching-text">Question Text *</Label>
        <Textarea
          id="matching-text"
          value={matchingText}
          onChange={(e) => setMatchingText(e.target.value)}
          placeholder="Enter the question"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Left Column Items *</Label>
          <div className="space-y-2 mt-2">
            {leftItems.map((item, index) => (
              <div key={item.id} className="flex gap-2">
                <Input
                  value={item.value}
                  onChange={(e) => {
                    const newItems = [...leftItems]
                    newItems[index].value = e.target.value
                    setLeftItems(newItems)
                  }}
                  placeholder={`Left ${index + 1}`}
                />
                {leftItems.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setLeftItems(leftItems.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLeftItems([...leftItems, { id: String(leftItems.length + 1), value: '', color: '#3b82f6' }])}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Left Item
          </Button>
        </div>

        <div>
          <Label>Right Column Items *</Label>
          <div className="space-y-2 mt-2">
            {rightItems.map((item, index) => (
              <div key={item.id} className="flex gap-2">
                <Input
                  value={item.value}
                  onChange={(e) => {
                    const newItems = [...rightItems]
                    newItems[index].value = e.target.value
                    setRightItems(newItems)
                  }}
                  placeholder={`Right ${index + 1}`}
                />
                {rightItems.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setRightItems(rightItems.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRightItems([...rightItems, { id: String(rightItems.length + 1), value: '' }])}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Right Item
          </Button>
        </div>
      </div>

      <div>
        <Label>Correct Matches *</Label>
        <div className="space-y-2 mt-2">
          {leftItems.map((leftItem) => (
            <div key={leftItem.id} className="flex items-center gap-2">
              <span className="text-sm font-medium min-w-[150px]">{leftItem.value || `Left ${leftItem.id}`}</span>
              <span>→</span>
              <Select
                value={matchingAnswers[leftItem.id] || ''}
                onValueChange={(value) => setMatchingAnswers({ ...matchingAnswers, [leftItem.id]: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select match" />
                </SelectTrigger>
                <SelectContent>
                  {rightItems.map((rightItem) => (
                    <SelectItem key={rightItem.id} value={rightItem.id}>
                      {rightItem.value || `Right ${rightItem.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderIdentifyForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="identify-text">Question Text *</Label>
        <Textarea
          id="identify-text"
          value={identifyText}
          onChange={(e) => setIdentifyText(e.target.value)}
          placeholder="Enter the question"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="identify-answer">Answer *</Label>
        <Input
          id="identify-answer"
          value={identifyAnswer}
          onChange={(e) => setIdentifyAnswer(e.target.value)}
          placeholder="Enter the answer"
        />
      </div>

      <div>
        <Label htmlFor="identify-refs">Topic References (comma separated)</Label>
        <Input
          id="identify-refs"
          value={identifyTopicRefs}
          onChange={(e) => setIdentifyTopicRefs(e.target.value)}
          placeholder="e.g., Topic 1, Topic 2"
        />
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editQuestion ? 'Edit' : 'Add'} Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question-type">Question Type *</Label>
            <Select value={questionType} onValueChange={setQuestionType} disabled={!!editQuestion}>
              <SelectTrigger id="question-type">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {questionType === 'MCQ' && renderMCQForm()}
          {questionType === 'BLANKS' && renderBlanksForm()}
          {(questionType === 'SHORT' || questionType === 'LONG') && renderTextForm()}
          {questionType === 'MATCHING' && renderMatchingForm()}
          {questionType === 'IDENTIFY' && renderIdentifyForm()}

          {/* Hints Section (Optional for all question types) */}
          {questionType && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">💡</span>
                <h3 className="text-sm font-semibold">Hints (Optional)</h3>
              </div>

              <div>
                <Label htmlFor="hint-text">Hint Text</Label>
                <Textarea
                  id="hint-text"
                  value={hintText}
                  onChange={(e) => setHintText(e.target.value)}
                  placeholder="Enter hint text to help students"
                  rows={3}
                />
              </div>

              <div>
                <Label>Topic Pills</Label>
                <div className="space-y-2 mt-2">
                  {topicPills.map((pill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={pill}
                        onChange={(e) => {
                          const newPills = [...topicPills]
                          newPills[index] = e.target.value
                          setTopicPills(newPills)
                        }}
                        placeholder={`Topic reference ${index + 1}`}
                      />
                      {topicPills.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setTopicPills(topicPills.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTopicPills([...topicPills, ''])}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic Pill
                </Button>
              </div>

              <div>
                <Label>Keyword Pills</Label>
                <div className="space-y-2 mt-2">
                  {keywordPills.map((pill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={pill}
                        onChange={(e) => {
                          const newPills = [...keywordPills]
                          newPills[index] = e.target.value
                          setKeywordPills(newPills)
                        }}
                        placeholder={`Keyword ${index + 1}`}
                      />
                      {keywordPills.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setKeywordPills(keywordPills.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setKeywordPills([...keywordPills, ''])}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keyword Pill
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={saving || !questionType}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editQuestion ? 'Update' : 'Add'} Question
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
