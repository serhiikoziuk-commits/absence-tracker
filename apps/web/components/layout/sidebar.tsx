'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  User,
  Settings2,
  LogOut,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { label: 'Calendar', href: 'calendar', icon: CalendarDays },
  { label: 'Requests', href: 'requests', icon: ClipboardList },
  { label: 'Profile', href: 'profile', icon: User },
  { label: 'Admin Panel', href: 'admin/users', icon: Settings2, adminOnly: true },
]

interface SidebarProps {
  workspaceSlug: string
  workspaceName: string
  userFirstName?: string | null
  userLastName?: string | null
  userAvatarUrl?: string | null
  isAdmin?: boolean
  onSignOut?: () => void
}

export function Sidebar({
  workspaceSlug,
  workspaceName,
  userFirstName,
  userLastName,
  userAvatarUrl,
  isAdmin,
  onSignOut,
}: SidebarProps) {
  const pathname = usePathname()
  const base = `/${workspaceSlug}`

  const isActive = (href: string) =>
    pathname.startsWith(`${base}/${href}`)

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      {/* Workspace header */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-100 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <span className="truncate text-sm font-semibold text-gray-900">{workspaceName}</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={`${base}/${item.href}`}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon
              className={cn(
                'h-4 w-4 shrink-0',
                isActive(item.href) ? 'text-primary-600' : 'text-gray-400'
              )}
            />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatarUrl ?? undefined} />
            <AvatarFallback>{getInitials(userFirstName, userLastName)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-gray-900">
              {[userFirstName, userLastName].filter(Boolean).join(' ') || 'User'}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-md p-1 text-gray-400 hover:text-gray-700 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
