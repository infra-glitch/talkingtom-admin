'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import EmptyState from '@/components/EmptyState'
import FilterBar from '@/components/FilterBar'
import { useRouter } from 'next/navigation'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, subject: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Filter state
  const [schools, setSchools] = useState([])
  const [grades, setGrades] = useState([])
  const [curriculums, setCurriculums] = useState([])
  const [filters, setFilters] = useState([
    { key: 'school', label: 'School', type: 'select', value: '', options: [] },
    { key: 'grade', label: 'Grade', type: 'select', value: '', options: [] },
    { key: 'curriculum', label: 'Curriculum', type: 'select', value: '', options: [] },
    { key: 'search', label: 'Search', type: 'text', value: '', placeholder: 'Search by subject name' }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [subjects, filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch subjects
      const subjectsRes = await fetch('/api/subjects')
      const subjectsData = await subjectsRes.json()
      if (subjectsData.success) {
        setSubjects(subjectsData.subjects || [])
      }

      // Fetch schools for filter
      const schoolsRes = await fetch('/api/schools')
      const schoolsData = await schoolsRes.json()
      if (schoolsData.success) {
        const schoolOptions = (schoolsData.schools || []).map(s => ({ value: s.id, label: s.name }))
        setSchools(schoolsData.schools || [])
        updateFilterOptions('school', schoolOptions)
      }

      // Fetch grades for filter
      const gradesRes = await fetch('/api/grades')
      const gradesData = await gradesRes.json()
      if (gradesData.success) {
        const gradeOptions = (gradesData.grades || []).map(g => ({ value: g.id, label: g.grade }))
        setGrades(gradesData.grades || [])
        updateFilterOptions('grade', gradeOptions)
      }

      // Fetch curriculums for filter
      const curriculumsRes = await fetch('/api/curriculums')
      const curriculumsData = await curriculumsRes.json()
      if (curriculumsData.success) {
        const curriculumOptions = (curriculumsData.curriculums || []).map(c => ({ value: c.id, label: c.name }))
        setCurriculums(curriculumsData.curriculums || [])
        updateFilterOptions('curriculum', curriculumOptions)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilterOptions = (key, options) => {
    setFilters(prev => prev.map(f => f.key === key ? { ...f, options } : f))
  }

  const applyFilters = () => {
    let filtered = [...subjects]

    filters.forEach(filter => {
      if (filter.value) {
        if (filter.key === 'school') {
          filtered = filtered.filter(s => s.school_id === filter.value)
        } else if (filter.key === 'grade') {
          filtered = filtered.filter(s => s.grade_id === filter.value)
        } else if (filter.key === 'curriculum') {
          filtered = filtered.filter(s => s.curriculum_id === filter.value)
        } else if (filter.key === 'search') {
          filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(filter.value.toLowerCase())
          )
        }
      }
    })

    setFilteredSubjects(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => prev.map(f => f.key === key ? { ...f, value } : f))
  }

  const handleClearFilters = () => {
    setFilters(prev => prev.map(f => ({ ...f, value: '' })))
  }

  const handleDelete = async () => {
    if (!deleteDialog.subject) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/subjects/${deleteDialog.subject.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        setSubjects(subjects.filter(s => s.id !== deleteDialog.subject.id))
        setDeleteDialog({ open: false, subject: null })
      } else {
        alert('Failed to delete subject: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting subject:', error)
      alert('Failed to delete subject')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Subject Name' },
    { 
      key: 'school', 
      label: 'School',
      render: (value) => value?.name || '-'
    },
    { 
      key: 'grade', 
      label: 'Grade',
      render: (value) => value?.grade || '-'
    },
    { 
      key: 'curriculum', 
      label: 'Curriculum',
      render: (value) => value?.name || '-'
    },
    { 
      key: 'book', 
      label: 'Book',
      render: (value) => value?.title || '-'
    },
  ]

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground mt-2">
            Manage all subjects in the system
          </p>
        </div>
        <Link href="/admin/subjects/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </Link>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {filteredSubjects.length === 0 ? (
        subjects.length === 0 ? (
          <EmptyState
            title="No subjects found"
            description="Get started by creating your first subject"
            actionLabel="Add Subject"
            actionHref="/admin/subjects/new"
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No subjects match your filters
          </div>
        )
      ) : (
        <DataTable
          columns={columns}
          data={filteredSubjects}
          viewPath="/admin/subjects"
          editPath="/admin/subjects"
          onDelete={(subject) => setDeleteDialog({ open: true, subject })}
          emptyMessage="No subjects found"
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, subject: null })}
        onConfirm={handleDelete}
        title="Delete Subject?"
        description={`Are you sure you want to delete "${deleteDialog.subject?.name}"? This will mark it as inactive.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
