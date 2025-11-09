import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Volume2, Image as ImageIcon } from 'lucide-react'

export default function TopicCard({ topic, index }) {
  console.log(topic);
  const segments = topic.simplified_explanation || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Topic {index + 1}</Badge>
              {topic.subtopic && <Badge variant="secondary">Subtopic</Badge>}
            </div>
            <CardTitle className="text-xl">{topic.topic} | {topic.topic_id}</CardTitle>
            {topic.subtopic && (
              <p className="text-sm text-muted-foreground mt-1">{topic.subtopic}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {segments.map((segment, segIndex) => (
          <div key={segment.id || segIndex} className="space-y-3">
            {/* Original Text */}
            {segment.originalText && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Original:</p>
                <p className="text-sm">{segment.originalText}</p>
              </div>
            )}

            {/* Simplified Explanation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">Simplified Explanation:</p>
                {segment.audioSrcUrl && (
                  <Badge variant="outline" className="text-xs">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Audio Available
                  </Badge>
                )}
              </div>
              <p className="text-sm text-blue-900">{segment.text}</p>
            </div>

            {/* Media Map */}
            {segment.mediaMap && segment.mediaMap.length > 0 && (
              <div className="space-y-2">
                {segment.mediaMap.map((media, mediaIndex) => (
                  <div key={media.key || mediaIndex} className="p-3 bg-accent rounded-lg">
                    <div className="flex items-start gap-3">
                      {media.type === 'image' && <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{media.type}</p>
                        {media.caption && (
                          <p className="text-xs text-muted-foreground mt-1">{media.caption}</p>
                        )}
                        {media.url && (
                          <a 
                            href={media.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 block"
                          >
                            View {media.type}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {segIndex < segments.length - 1 && (
              <div className="border-t my-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
