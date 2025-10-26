'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import EmptyState from '@/components/EmptyState'
import { useRouter } from 'next/navigation'

export default function SchoolsPage() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, school: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/schools')
      const data = await res.json()
      if (data.success) {
        setSchools(data.schools || [])
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.school) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/schools/${deleteDialog.school.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        setSchools(schools.filter(s => s.id !== deleteDialog.school.id))
        setDeleteDialog({ open: false, school: null })
      } else {
        alert('Failed to delete school: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting school:', error)
      alert('Failed to delete school')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'School Name' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { 
      key: 'address', 
      label: 'Address',
      render: (value) => value || '-'
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
          <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
          <p className="text-muted-foreground mt-2">
            Manage all schools in the system
          </p>
        </div>
        <Link href="/admin/schools/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add School
          </Button>
        </Link>
      </div>

      {schools.length === 0 ? (
        <EmptyState
          title="No schools found"
          description="Get started by creating your first school"
          actionLabel="Add School"
          actionHref="/admin/schools/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={schools}
          viewPath="/admin/schools"
          editPath="/admin/schools"
          onDelete={(school) => setDeleteDialog({ open: true, school })}
          emptyMessage="No schools found"
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, school: null })}
        onConfirm={handleDelete}
        title="Delete School?"
        description={`Are you sure you want to delete "${deleteDialog.school?.name}"? This will mark it as inactive.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
