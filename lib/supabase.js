import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using dummy values.')
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key'
)

// Helper functions for database operations
export const db = {
  // Books
  async getBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createBook(book) {
    const { data, error } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Lessons
  async getLessons(bookId = null) {
    let query = supabase
      .from('lessons')
      .select('*')
    
    if (bookId) {
      query = query.eq('book_id', bookId)
    }
    
    const { data, error } = await query.order('lesson_number', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createLesson(lesson) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lesson])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLesson(id, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Lesson Topics
  async getLessonTopics(lessonId) {
    const { data, error } = await supabase
      .from('lesson_topics')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createLessonTopic(topic) {
    const { data, error } = await supabase
      .from('lesson_topics')
      .insert([topic])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLessonTopic(id, updates) {
    const { data, error } = await supabase
      .from('lesson_topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Processing Jobs
  async createProcessingJob(job) {
    const { data, error } = await supabase
      .from('processing_jobs')
      .insert([job])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateProcessingJob(id, updates) {
    const { data, error } = await supabase
      .from('processing_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getProcessingJob(id) {
    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Storage helpers
export const storage = {
  async uploadPDF(file, lessonId) {
    const fileName = `lessons/${lessonId}/original.pdf`
    const { data, error } = await supabase.storage
      .from('lesson-pdfs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    return data
  },

  async uploadImage(file, lessonId, pageNumber) {
    const fileName = `lessons/${lessonId}/pages/page-${pageNumber}.png`
    const { data, error } = await supabase.storage
      .from('lesson-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    return data
  },

  async uploadAudio(file, lessonId, segmentId) {
    const fileName = `lessons/${lessonId}/audio/${segmentId}.mp3`
    const { data, error } = await supabase.storage
      .from('lesson-audio')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    return data
  },

  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}
