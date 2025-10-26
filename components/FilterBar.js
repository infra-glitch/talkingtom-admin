'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function FilterBar({ filters, onFilterChange, onClearFilters }) {
  const hasActiveFilters = filters.some(f => f.value)

  return (
    <div className="bg-muted/50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.key}>
            <Label htmlFor={filter.key} className="text-sm font-medium mb-2 block">
              {filter.label}
            </Label>
            {filter.type === 'select' ? (
              <Select
                value={filter.value || ''}
                onValueChange={(value) => onFilterChange(filter.key, value)}
              >
                <SelectTrigger id={filter.key}>
                  <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={filter.key}
                type={filter.type || 'text'}
                placeholder={filter.placeholder || `Filter by ${filter.label}`}
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      {hasActiveFilters && onClearFilters && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
