'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import EmptyState from '@/components/EmptyState'
import { useRouter } from 'next/navigation'

export default function GradesPage() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, grade: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/grades')
      const data = await res.json()
      if (data.success) {
        setGrades(data.grades || [])
      }
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.grade) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/grades/${deleteDialog.grade.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        setGrades(grades.filter(g => g.id !== deleteDialog.grade.id))
        setDeleteDialog({ open: false, grade: null })
      } else {
        alert('Failed to delete grade: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting grade:', error)
      alert('Failed to delete grade')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'grade', label: 'Grade' },
    { 
      key: 'created_at', 
      label: 'Created At',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
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
          <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground mt-2">
            Manage all grades in the system
          </p>
        </div>
        <Link href="/admin/grades/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Grade
          </Button>
        </Link>
      </div>

      {grades.length === 0 ? (
        <EmptyState
          title="No grades found"
          description="Get started by creating your first grade"
          actionLabel="Add Grade"
          actionHref="/admin/grades/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={grades}
          viewPath="/admin/grades"
          editPath="/admin/grades"
          onDelete={(grade) => setDeleteDialog({ open: true, grade })}
          emptyMessage="No grades found"
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, grade: null })}
        onConfirm={handleDelete}
        title="Delete Grade?"
        description={`Are you sure you want to delete "${deleteDialog.grade?.grade}"? This will mark it as inactive.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
