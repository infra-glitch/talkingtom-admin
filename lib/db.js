// Database helper functions that use authenticated server client for RLS
import { createClient } from '@/lib/supabase/server'

export const db = {
  // Schools
  async getSchools() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('school')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createSchool(school) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('school')
      .insert([school])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getSchoolById(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('school')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateSchool(id, updates) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('school')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSchool(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('school')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Curriculums
  async getCurriculums() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createCurriculum(curriculum) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('curriculum')
      .insert([curriculum])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getCurriculumById(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateCurriculum(id, updates) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('curriculum')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCurriculum(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('curriculum')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Grades
  async getGrades() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('grade')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createGrade(grade) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('grade')
      .insert([grade])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getGradeById(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('grade')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateGrade(id, updates) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('grade')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteGrade(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('grade')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Subjects
  async getSubjects() {
    const supabase = createClient()
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
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subject')
      .insert([subject])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getSubjectById(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subject')
      .select(`
        *,
        school:school_id(*),
        curriculum:curriculum_id(*),
        grade:grade_id(*),
        book:book_id(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateSubject(id, updates) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subject')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSubject(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subject')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Books
  async getBooks() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('book')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createBook(book) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('book')
      .insert([book])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getBookById(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('book')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateBook(id, updates) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('book')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteBook(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('book')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Lessons
  async getLessons(bookId = null) {
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lesson')
      .insert([lesson])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLesson(id, updates) {
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lesson_topic')
      .insert([topic])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLessonTopic(id, updates) {
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_section')
      .insert([section])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getQuizSectionById(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_section')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateQuizSection(id, updates) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_section')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteQuizSection(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_section')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Quiz Questions
  async getQuizQuestions(sectionId) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_question')
      .select('*')
      .eq('section_id', sectionId)
      .eq('active', true)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getQuizQuestionById(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_question')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createQuizQuestion(question) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_question')
      .insert([question])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateQuizQuestion(id, updates) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_question')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteQuizQuestion(id) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_question')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Storage helpers with authenticated client
export const storage = {
  async uploadPDF(file, lessonId) {
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}
