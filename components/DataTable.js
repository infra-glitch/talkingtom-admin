'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function DataTable({ 
  columns, 
  data, 
  onView, 
  onEdit, 
  onDelete,
  viewPath,
  editPath,
  idField = 'id',
  emptyMessage = 'No data available'
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row[idField]}>
              {columns.map((column) => (
                <TableCell key={`${row[idField]}-${column.key}`}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {(onView || viewPath) && (
                    viewPath ? (
                      <Link href={`${viewPath}/${row[idField]}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onView(row)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )
                  )}
                  {(onEdit || editPath) && (
                    editPath ? (
                      <Link href={`${editPath}/${row[idField]}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(row)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
