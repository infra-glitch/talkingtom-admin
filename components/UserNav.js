import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export default async function UserNav() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const userEmail = user.email || 'User'
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium">{userName}</p>
        <p className="text-xs text-muted-foreground">{userEmail}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
          {initials}
        </div>
        <form action="/auth/logout" method="post">
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
