'use client'

import AuthGuard from '@/components/AuthGuard'
import UserMenu from '@/components/UserMenu'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function AdminLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Lesson Admin</span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/admin" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/setup" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Setup
              </Link>
              <UserMenu />
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
