'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Circle, Lightbulb } from 'lucide-react'

// Hints Section Component (reusable for all question types)
function HintsSection({ hints }) {
  if (!hints) return null

  const hasContent = hints.hint_text || hints.topic_pills?.length > 0 || hints.keyword_pills?.length > 0

  if (!hasContent) return null

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-blue-900">Hints</p>
      </div>

      {hints.hint_text && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-900">{hints.hint_text}</p>
        </div>
      )}

      {hints.topic_pills && hints.topic_pills.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-muted-foreground mb-1">Topic Pills:</p>
          <div className="flex flex-wrap gap-1">
            {hints.topic_pills.map((pill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {pill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hints.keyword_pills && hints.keyword_pills.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Keyword Pills:</p>
          <div className="flex flex-wrap gap-1">
            {hints.keyword_pills.map((pill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {pill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuestionCard({ question, questionNumber }) {
  const questionType = question.question_type
  const questionData = question.question

  // Render based on question type
  const renderQuestion = () => {
    switch (questionType) {
      case 'MCQ':
        return <MCQQuestion data={questionData} />
      case 'BLANKS':
        return <BlanksQuestion data={questionData} />
      case 'SHORT':
      case 'LONG':
        return <TextQuestion data={questionData} type={questionType} />
      case 'MATCHING':
        return <MatchingQuestion data={questionData} />
      case 'IDENTIFY':
        return <IdentifyQuestion data={questionData} />
      default:
        return <div className="text-sm text-muted-foreground">Unknown question type: {questionType}</div>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Q{questionNumber}</Badge>
            <Badge>{questionType}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderQuestion()}
      </CardContent>
    </Card>
  )
}

// MCQ Question Component
function MCQQuestion({ data }) {
  if (!data || !data.question) return null

  return (
    <div className="space-y-4">
      <div className="text-base font-medium">{data.question.text}</div>
      
      <div className="space-y-2">
        {data.question.options?.map((option) => {
          const isCorrect = data.answer === option.id
          return (
            <div
              key={option.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                isCorrect 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                  {option.value}
                </p>
                {isCorrect && (
                  <p className="text-xs text-green-700 mt-1">✓ Correct Answer</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {data.question.topic_references && data.question.topic_references.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Topic References:</p>
          <div className="flex flex-wrap gap-1">
            {data.question.topic_references.map((ref, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{ref}</Badge>
            ))}
          </div>
        </div>
      )}

      <HintsSection hints={data.hints} />
    </div>
  )
}

// Fill in the Blanks Question Component
function BlanksQuestion({ data }) {
  if (!data || !data.question) return null

  return (
    <div className="space-y-4">
      <div className="text-base font-medium">
        {data.question.text}
      </div>
      
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-medium text-green-900 mb-2">
          Answer{data.answer?.length > 1 ? 's' : ''}:
        </p>
        <div className="space-y-2">
          {data.answer?.map((ans, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 justify-center">{idx + 1}</Badge>
              <span className="text-sm font-medium text-green-900">{ans}</span>
            </div>
          ))}
        </div>
      </div>

      {data.topic_references && data.topic_references.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Topic References:</p>
          <div className="flex flex-wrap gap-1">
            {data.topic_references.map((ref, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{ref}</Badge>
            ))}
          </div>
        </div>
      )}

      <HintsSection hints={data.hints} />
    </div>
  )
}

// Short/Long Text Question Component
function TextQuestion({ data, type }) {
  if (!data || !data.question) return null

  return (
    <div className="space-y-4">
      <div className="text-base font-medium">{data.question.text}</div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-2">Expected Answer:</p>
        <p className="text-sm text-blue-900 whitespace-pre-wrap">{data.answer}</p>
      </div>

      {data.topicReferences && data.topicReferences.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Topic References:</p>
          <div className="flex flex-wrap gap-1">
            {data.topicReferences.map((ref, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{ref}</Badge>
            ))}
          </div>
        </div>
      )}

      <HintsSection hints={data.hints} />
    </div>
  )
}

// Matching Question Component
function MatchingQuestion({ data }) {
  if (!data || !data.question) return null

  const getMatchedRight = (leftId) => {
    const rightId = data.answer?.[leftId]
    return data.question.rightItems?.find(item => item.id === rightId)
  }

  return (
    <div className="space-y-4">
      <div className="text-base font-medium mb-4">{data.question.text}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Items */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Column A</p>
          {data.question.leftItems?.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border-2"
              style={{ 
                borderColor: item.color || '#e5e7eb',
                backgroundColor: `${item.color}10` || '#f9fafb'
              }}
            >
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Right Items with Matches */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Column B</p>
          {data.question.leftItems?.map((leftItem) => {
            const matchedRight = getMatchedRight(leftItem.id)
            return (
              <div
                key={`match-${leftItem.id}`}
                className="p-3 rounded-lg border-2 bg-green-50 border-green-500"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-900">
                    {matchedRight?.value || 'No match'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-2">Correct Matches:</p>
        <div className="space-y-1">
          {data.question.leftItems?.map((leftItem) => {
            const matchedRight = getMatchedRight(leftItem.id)
            return (
              <div key={`answer-${leftItem.id}`} className="text-sm">
                <span className="font-medium">{leftItem.value}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="font-medium">{matchedRight?.value}</span>
              </div>
            )
          })}
        </div>
      </div>

      <HintsSection hints={data.hints} />
    </div>
  )
}

// Identify Question Component
function IdentifyQuestion({ data }) {
  if (!data || !data.question) return null

  return (
    <div className="space-y-4">
      <div className="text-base font-medium">{data.question.text}</div>
      
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm font-medium text-purple-900 mb-2">Answer:</p>
        <p className="text-sm text-purple-900">{data.answer}</p>
      </div>

      {data.topicReferences && data.topicReferences.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Topic References:</p>
          <div className="flex flex-wrap gap-1">
            {data.topicReferences.map((ref, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{ref}</Badge>
            ))}
          </div>
        </div>
      )}

      <HintsSection hints={data.hints} />
    </div>
  )
}
