import UserNav from '@/components/UserNav'
import Link from 'next/link'
import { BookOpen, ChevronDown } from 'lucide-react'
// import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }) {
  // const pathname = usePathname()

  // Fix this later
  // Cant use usePathName in a server component issue
  const pathname = ""
  const isActive = (path) => {
    return false;
  }

  return (
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
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/admin' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Dashboard
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`h-auto p-0 text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/admin/schools') || isActive('/admin/grades') || 
                    isActive('/admin/curriculums') || isActive('/admin/subjects') || 
                    isActive('/admin/books')
                    ? 'text-primary' : 'text-foreground/60'
                  }`}
                >
                  Masters <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/admin/schools">Schools</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/grades">Grades</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/curriculums">Curriculums</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/subjects">Subjects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/books">Books</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link 
              href="/admin/lessons/new" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/admin/lessons') ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Lessons
            </Link>

            <Link 
              href="/admin/setup" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/admin/setup' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Setup
            </Link>

            <UserNav />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}
