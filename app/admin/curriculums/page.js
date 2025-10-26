'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import EmptyState from '@/components/EmptyState'
import { useRouter } from 'next/navigation'

export default function CurriculumsPage() {
  const [curriculums, setCurriculums] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, curriculum: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCurriculums()
  }, [])

  const fetchCurriculums = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/curriculums')
      const data = await res.json()
      if (data.success) {
        setCurriculums(data.curriculums || [])
      }
    } catch (error) {
      console.error('Error fetching curriculums:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.curriculum) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/curriculums/${deleteDialog.curriculum.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        setCurriculums(curriculums.filter(c => c.id !== deleteDialog.curriculum.id))
        setDeleteDialog({ open: false, curriculum: null })
      } else {
        alert('Failed to delete curriculum: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting curriculum:', error)
      alert('Failed to delete curriculum')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Curriculum Name' },
    { key: 'country', label: 'Country' },
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
          <h1 className="text-3xl font-bold tracking-tight">Curriculums</h1>
          <p className="text-muted-foreground mt-2">
            Manage all curriculums in the system
          </p>
        </div>
        <Link href="/admin/curriculums/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Curriculum
          </Button>
        </Link>
      </div>

      {curriculums.length === 0 ? (
        <EmptyState
          title="No curriculums found"
          description="Get started by creating your first curriculum"
          actionLabel="Add Curriculum"
          actionHref="/admin/curriculums/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={curriculums}
          viewPath="/admin/curriculums"
          editPath="/admin/curriculums"
          onDelete={(curriculum) => setDeleteDialog({ open: true, curriculum })}
          emptyMessage="No curriculums found"
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, curriculum: null })}
        onConfirm={handleDelete}
        title="Delete Curriculum?"
        description={`Are you sure you want to delete "${deleteDialog.curriculum?.name}"? This will mark it as inactive.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
