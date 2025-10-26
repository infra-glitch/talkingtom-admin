'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default function EmptyState({ 
  title = 'No items found', 
  description = 'Get started by creating a new item',
  actionLabel = 'Create New',
  actionHref,
  onAction,
  icon: Icon
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        {Icon ? <Icon className="h-12 w-12 text-muted-foreground" /> : <PlusCircle className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {(actionHref || onAction) && (
        actionHref ? (
          <Link href={actionHref}>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button onClick={onAction}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}
