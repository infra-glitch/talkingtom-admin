-- Supabase Database Schema for Lesson Digitization Platform
-- Run this in your Supabase SQL Editor to create the required tables

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  grade TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  thumbnail TEXT,
  slug TEXT,
  num_topics INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson Topics Table
CREATE TABLE IF NOT EXISTS lesson_topics (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  "order" INTEGER NOT NULL,
  simplified_explanation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Jobs Table (for tracking pipeline progress)
CREATE TABLE IF NOT EXISTS processing_jobs (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  stage TEXT DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  metadata JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_book_id ON lessons(book_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lesson_topics_lesson_id ON lesson_topics(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_topics_order ON lesson_topics("order");
CREATE INDEX IF NOT EXISTS idx_processing_jobs_lesson_id ON processing_jobs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Allow all operations for now - adjust based on your auth needs)
CREATE POLICY "Allow all operations on books" ON books FOR ALL USING (true);
CREATE POLICY "Allow all operations on lessons" ON lessons FOR ALL USING (true);
CREATE POLICY "Allow all operations on lesson_topics" ON lesson_topics FOR ALL USING (true);
CREATE POLICY "Allow all operations on processing_jobs" ON processing_jobs FOR ALL USING (true);

-- Create Storage Buckets (run separately or via Supabase Dashboard)
-- You'll need to create these buckets manually:
-- 1. lesson-pdfs (for storing uploaded PDFs)
-- 2. lesson-images (for storing extracted page images)
-- 3. lesson-audio (for storing generated audio files)

-- Storage bucket policies should be set to allow public read access
