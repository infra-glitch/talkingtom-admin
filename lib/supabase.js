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
  // Schools
  async getSchools() {
    const { data, error } = await supabase
      .from('school')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createSchool(school) {
    const { data, error } = await supabase
      .from('school')
      .insert([school])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Curriculums
  async getCurriculums() {
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createCurriculum(curriculum) {
    const { data, error } = await supabase
      .from('curriculum')
      .insert([curriculum])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Grades
  async getGrades() {
    const { data, error } = await supabase
      .from('grade')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createGrade(grade) {
    const { data, error } = await supabase
      .from('grade')
      .insert([grade])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Subjects
  async getSubjects() {
    const { data, error } = await supabase
      .from('subject')
      .select(`
        *,
        school:school_id(*),
        curriculum:curriculum_id(*),
        grade:grade_id(*),
        book:book_id(*)
      `)
      .eq('active', true)
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createSubject(subject) {
    const { data, error } = await supabase
      .from('subject')
      .insert([subject])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Books
  async getBooks() {
    const { data, error } = await supabase
      .from('book')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createBook(book) {
    const { data, error } = await supabase
      .from('book')
      .insert([book])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateBook(id, updates) {
    const { data, error } = await supabase
      .from('book')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Lessons
  async getLessons(bookId = null) {
    let query = supabase
      .from('lesson')
      .select(`
        *,
        book:book_id(*)
      `)
      .eq('active', true)
    
    if (bookId) {
      query = query.eq('book_id', bookId)
    }
    
    const { data, error } = await query.order('lesson_number', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getLessonById(id) {
    const { data, error } = await supabase
      .from('lesson')
      .select(`
        *,
        book:book_id(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createLesson(lesson) {
    const { data, error } = await supabase
      .from('lesson')
      .insert([lesson])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLesson(id, updates) {
    const { data, error } = await supabase
      .from('lesson')
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
      .from('lesson_topic')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('active', true)
      .order('order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createLessonTopic(topic) {
    const { data, error } = await supabase
      .from('lesson_topic')
      .insert([topic])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLessonTopic(id, updates) {
    const { data, error } = await supabase
      .from('lesson_topic')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Quiz Sections
  async getQuizSections(lessonId) {
    const { data, error } = await supabase
      .from('quiz_section')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('active', true)
      .order('order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createQuizSection(section) {
    const { data, error } = await supabase
      .from('quiz_section')
      .insert([section])
      .select()
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
