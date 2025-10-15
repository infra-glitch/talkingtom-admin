# Lesson Digitization Admin Panel - Setup Guide

## Overview
This admin panel manages the complete pipeline for digitizing lesson PDFs into interactive, audio-enhanced content.

## Architecture
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **OCR**: Google Cloud Vision API
- **AI Segmentation**: OpenAI GPT-4
- **Text-to-Speech**: ElevenLabs

## Pipeline Stages
1. **PDF Upload** → Store in Supabase Storage
2. **PDF Extraction** → Extract page images
3. **OCR Processing** → Google Vision API extracts text and images
4. **AI Segmentation** → OpenAI structures content into topics/subtopics
5. **TTS Generation** → ElevenLabs creates audio for each segment
6. **Database Storage** → Save structured data to Supabase

## Setup Instructions

### 1. Database Setup (Supabase)

#### Create Your Tables
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL script from `SUPABASE_SCHEMA.sql`
4. Verify tables are created in the Table Editor

#### Create Storage Buckets
1. Go to Storage in Supabase Dashboard
2. Create three buckets:
   - `lesson-pdfs` (for uploaded PDFs)
   - `lesson-images` (for extracted page images)
   - `lesson-audio` (for generated audio files)
3. Set bucket policies to allow public read access

### 2. Environment Variables

Replace the dummy values in `/app/.env` with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key

# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_VISION_API_KEY=your-api-key
# OR use service account JSON (preferred)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# ElevenLabs API
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Get Your API Credentials

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Google Cloud Vision
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Cloud Vision API
4. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create Service Account
   - Grant "Cloud Vision API User" role
   - Create Key (JSON format)
   - Download and save the JSON file
5. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of this JSON file

#### ElevenLabs
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up or log in
3. Go to Profile → API Keys
4. Create a new API key
5. Copy to `ELEVENLABS_API_KEY`

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys
4. Create a new secret key
5. Copy to `OPENAI_API_KEY`

### 4. Run the Application

```bash
# Install dependencies (already done)
cd /app
yarn install

# Restart the server to load new environment variables
sudo supervisorctl restart nextjs

# Check status
sudo supervisorctl status
```

### 5. Access the Application

- **Homepage**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Upload Page**: http://localhost:3000/admin/upload

## Usage

### Creating a Book
1. Go to Admin Dashboard
2. Click "Add Book"
3. Enter book details (title, grade, subject)
4. Save

### Uploading a Lesson
1. Go to Upload page
2. Select the book
3. Enter lesson number and name
4. Upload PDF file (max 50MB)
5. Click "Upload & Process"
6. Monitor processing status in real-time

### Processing Pipeline
The system automatically:
1. Extracts page images from PDF
2. Runs OCR on each page
3. Uses AI to segment content into topics
4. Generates audio for each segment
5. Saves everything to Supabase

### Viewing Results
- Processing status shows real-time progress
- Once complete, view structured lesson content
- All data is stored in your Supabase tables

## Database Schema

### Books
- Basic book information (title, grade, subject)

### Lessons
- Lesson metadata linked to books
- Processing status tracking
- PDF URL reference

### Lesson Topics
- Structured content with topics/subtopics
- Simplified explanations (JSONB array)
- Each segment includes:
  - Original text
  - Simplified text
  - Audio URL
  - Associated images

### Processing Jobs
- Track pipeline progress
- Stage-by-stage status
- Error logging

## API Endpoints

### Books
- `GET /api/books` - List all books
- `POST /api/books` - Create new book

### Lessons
- `GET /api/lessons` - List all lessons
- `GET /api/lessons?bookId={id}` - Get lessons for a book
- `POST /api/lessons/upload` - Upload lesson PDF
- `POST /api/lessons/process` - Start processing
- `GET /api/lessons/process?lessonId={id}` - Get processing status

## Important Notes

### Current Implementation
The application is set up with **mock/dummy implementations** for the external services:
- OCR service returns sample data
- AI segmentation returns sample topics
- TTS service returns mock audio metadata

### Production Implementation
To use real services, you need to:

1. **Google Vision API** - Update `/app/lib/services/ocrService.js`:
   - Implement actual API calls using `@google-cloud/vision` package
   - Process real image data from PDFs

2. **OpenAI API** - Update `/app/lib/services/aiSegmentation.js`:
   - Implement actual GPT-4 API calls
   - Parse real AI responses

3. **ElevenLabs API** - Update `/app/lib/services/ttsService.js`:
   - Implement actual TTS API calls
   - Handle audio file uploads to Supabase Storage

4. **PDF Processing** - Update `/app/lib/services/pdfProcessor.js`:
   - Implement actual PDF-to-image conversion using `pdf-lib` or `pdfjs-dist`

### Why Mock Services?
The system is built with dummy credentials, so actual API calls would fail. The mock services allow you to:
- Test the complete UI/UX flow
- Understand the data structures
- See the processing pipeline
- Replace with real implementations when ready

## Troubleshooting

### "Supabase connection failed"
- Verify your Supabase URL and anon key in `.env`
- Check that tables exist in Supabase
- Ensure Row Level Security policies are set

### "Processing stuck"
- Check browser console for errors
- Verify all API credentials are set
- Check processing_jobs table for error messages

### "Upload failed"
- Check file size (must be < 50MB)
- Verify PDF file format
- Check Supabase Storage bucket exists

## Next Steps

1. Replace dummy credentials with real ones
2. Implement actual service integrations
3. Test with real PDF files
4. Add authentication (Supabase Auth)
5. Add lesson preview/editing features
6. Deploy to production

## Support
For issues or questions, check:
- Supabase documentation: https://supabase.com/docs
- Google Cloud Vision: https://cloud.google.com/vision/docs
- OpenAI API: https://platform.openai.com/docs
- ElevenLabs: https://elevenlabs.io/docs
