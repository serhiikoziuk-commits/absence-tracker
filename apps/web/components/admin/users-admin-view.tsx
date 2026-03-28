'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, UserCheck, UserX, Trash2, Pencil, Link2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { updateUserRole, updateUserStatus, updateUserDetails, adjustBalance, createInvite, createOpenInvite } from '@/lib/actions/admin'
import type { AdminUserRow } from '@/app/[workspace]/admin/users/page'

interface UsersAdminViewProps {
  users: AdminUserRow[]
  teams: { id: string; name: string }[]
  absenceTypes: { id: string; name: string; color: string }[]
  year: number
  workspaceSlug: string
}

export function UsersAdminView({ users, teams, absenceTypes, year, workspaceSlug }: UsersAdminViewProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleGenerateLink() {
    startTransition(async () => {
      const res = await createOpenInvite()
      if (res?.error) toast.error(res.error)
      else {
        const link = `${window.location.origin}/${workspaceSlug}/invite/${res.token}`
        setInviteLink(link)
        toast.success('Invite link generated!')
      }
    })
  }

  function handleStatusToggle(user: AdminUserRow) {
    const newStatus = user.status === 'active' ? 'blocked' : 'active'
    startTransition(async () => {
      const res = await updateUserStatus(user.id, newStatus)
      if (res?.error) toast.error(res.error)
      else toast.success(`User ${newStatus === 'active' ? 'activated' : 'blocked'}.`)
    })
  }

  function handleRoleToggle(user: AdminUserRow) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    startTransition(async () => {
      const res = await updateUserRole(user.id, newRole)
      if (res?.error) toast.error(res.error)
      else toast.success(`Role changed to ${newRole}.`)
    })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateLink} disabled={isPending}>
            <Link2 className="h-4 w-4" />
            Invite link
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" />
            Invite by email
          </Button>
        </div>
      </div>

      {inviteLink && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success-100 bg-success-100/40 px-4 py-3">
          <Link2 className="h-4 w-4 shrink-0 text-success-600" />
          <code className="flex-1 truncate text-xs text-gray-700">{inviteLink}</code>
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Copied!') }}>
            Copy
          </Button>
        </div>
      )}

      {/* User table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Member</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 md:table-cell">Team</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const userTeams = user.team_members?.map((tm) => tm.teams?.name).filter(Boolean) ?? []
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                    {userTeams.length > 0 ? userTeams.join(', ') : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>
                      {user.role === 'admin' ? 'Admin' : 'Member'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status as 'active' | 'blocked' | 'invited'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Pencil className="h-4 w-4" /> Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleToggle(user)}>
                          <UserCheck className="h-4 w-4" />
                          Make {user.role === 'admin' ? 'member' : 'admin'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                          <UserX className="h-4 w-4" />
                          {user.status === 'active' ? 'Block' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* User detail sheet */}
      {selectedUser && (
        <UserDetailSheet
          user={selectedUser}
          teams={teams}
          absenceTypes={absenceTypes}
          year={year}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Invite dialog */}
      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  )
}

// ── User Detail Sheet ──────────────────────────────────────────────────────────
function UserDetailSheet({ user, teams, absenceTypes, year, onClose }: {
  user: AdminUserRow
  teams: { id: string; name: string }[]
  absenceTypes: { id: string; name: string; color: string }[]
  year: number
  onClose: () => void
}) {
  const [jobTitle, setJobTitle] = useState(user.job_title ?? '')
  const [startDate, setStartDate] = useState(user.start_date ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const res = await updateUserDetails(user.id, { job_title: jobTitle, start_date: startDate || undefined })
      if (res?.error) toast.error(res.error)
      else { toast.success('User updated.'); onClose() }
    })
  }

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit user</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">
                {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          <Input
            label="Job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={isPending}
          />
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isPending}
          />

          {/* Balance adjustments */}
          {absenceTypes.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold text-gray-500">Absence balances ({year})</p>
              <div className="space-y-2">
                {absenceTypes.map((type) => (
                  <BalanceAdjustRow
                    key={type.id}
                    userId={user.id}
                    type={type}
                    year={year}
                  />
                ))}
              </div>
            </div>
          )}
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function BalanceAdjustRow({ userId, type, year }: { userId: string; type: { id: string; name: string; color: string }; year: number }) {
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdjust() {
    const days = parseFloat(value)
    if (isNaN(days) || days < 0) return
    startTransition(async () => {
      const res = await adjustBalance(userId, type.id, year, days)
      if (res?.error) toast.error(res.error)
      else toast.success(`${type.name} balance updated.`)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: type.color }} />
      <span className="flex-1 text-sm text-gray-700">{type.name}</span>
      <input
        type="number"
        min="0"
        step="0.5"
        placeholder="days"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-md border border-gray-200 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <Button size="sm" variant="outline" onClick={handleAdjust} disabled={isPending || !value}>
        Set
      </Button>
    </div>
  )
}

// ── Invite Dialog ──────────────────────────────────────────────────────────────
function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [emailsText, setEmailsText] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleInvite() {
    const emails = emailsText.split(/[\n,;]/).map((e) => e.trim()).filter(Boolean)
    if (emails.length === 0) return

    startTransition(async () => {
      const res = await createInvite(emails)
      if (res?.error) toast.error(res.error)
      else {
        toast.success(`${emails.length} invite${emails.length > 1 ? 's' : ''} sent.`)
        onClose()
        setEmailsText('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite team members</DialogTitle>
        </DialogHeader>
        <Textarea
          label="Email addresses"
          placeholder="jane@company.com&#10;bob@company.com&#10;..."
          value={emailsText}
          onChange={(e) => setEmailsText(e.target.value)}
          rows={5}
          helper="Enter one email per line, or separate by commas."
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInvite} disabled={isPending || !emailsText.trim()}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Send invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
