'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin dashboard
    router.push('/admin')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to admin...</p>
    </div>
  )
}

function OldHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Lesson Digitization Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Transform your PDF lessons into interactive, audio-enhanced digital content with AI-powered processing
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/admin">
              <Button size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Go to Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>PDF Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload PDF lessons and automatically extract page images for processing
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>OCR Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Google Cloud Vision API extracts text and images with high accuracy
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>AI Segmentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                OpenAI structures content into topics, subtopics, and simplified explanations
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Audio Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                ElevenLabs converts text to natural-sounding audio for each segment
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pipeline Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Automated Processing Pipeline</CardTitle>
              <CardDescription>
                Each uploaded lesson goes through a comprehensive 5-stage processing pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">PDF Page Extraction</h3>
                    <p className="text-sm text-muted-foreground">
                      Extract individual page images from uploaded PDF
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">OCR Processing (Google Vision)</h3>
                    <p className="text-sm text-muted-foreground">
                      Extract text and identify images from each page with OCR technology
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Content Segmentation (OpenAI)</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically organize content into topics, subtopics, and simplified explanations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">Audio Generation (ElevenLabs)</h3>
                    <p className="text-sm text-muted-foreground">
                      Convert each text segment to natural-sounding speech
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold">Database Storage (Supabase)</h3>
                    <p className="text-sm text-muted-foreground">
                      Save all structured content, images, and audio to your database
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Upload your first lesson PDF and watch the magic happen
          </p>
          <Link href="/admin/upload">
            <Button size="lg">
              <Upload className="mr-2 h-5 w-5" />
              Upload Your First Lesson
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
