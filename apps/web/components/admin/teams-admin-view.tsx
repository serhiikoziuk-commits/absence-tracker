'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Users, Crown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getInitials } from '@/lib/utils'
import { createTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember } from '@/lib/actions/admin'
import type { TeamRow } from '@/app/[workspace]/admin/teams/page'

interface TeamsAdminViewProps {
  teams: TeamRow[]
  allUsers: { id: string; first_name: string | null; last_name: string | null; email: string; avatar_url: string | null }[]
}

export function TeamsAdminView({ teams, allUsers }: TeamsAdminViewProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamRow | null>(null)
  const [newName, setNewName] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await createTeam(newName)
      if (res?.error) toast.error(res.error)
      else { toast.success('Team created.'); setCreateOpen(false); setNewName('') }
    })
  }

  function handleDelete(teamId: string) {
    startTransition(async () => {
      const res = await deleteTeam(teamId)
      if (res?.error) toast.error(res.error)
      else toast.success('Team deleted.')
    })
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New team
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Users className="mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">No teams yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm">{team.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setSelectedTeam(team)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(team.id)}
                    className="text-error-600 hover:bg-error-100" disabled={isPending}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {team.team_members.length === 0 ? (
                  <p className="text-xs text-gray-400">No members yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {team.team_members.map((member) => (
                      member.users && (
                        <div key={member.user_id} className="flex items-center gap-2.5">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.users.avatar_url ?? undefined} />
                            <AvatarFallback className="text-[9px]">{getInitials(member.users.first_name, member.users.last_name)}</AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-xs text-gray-700 truncate">
                            {[member.users.first_name, member.users.last_name].filter(Boolean).join(' ') || member.users.email}
                          </span>
                          {member.is_manager && (
                            <Crown className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
                <Button size="sm" variant="ghost" className="mt-3 w-full text-xs" onClick={() => setSelectedTeam(team)}>
                  Manage members
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create team</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Team name" value={newName} onChange={(e) => setNewName(e.target.value)} required autoFocus />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending || !newName}>
                {isPending ? <Loader2 className="animate-spin" /> : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Team members sheet */}
      {selectedTeam && (
        <TeamMembersSheet
          team={selectedTeam}
          allUsers={allUsers}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </>
  )
}

function TeamMembersSheet({ team, allUsers, onClose }: {
  team: TeamRow
  allUsers: { id: string; first_name: string | null; last_name: string | null; email: string; avatar_url: string | null }[]
  onClose: () => void
}) {
  const [addUserId, setAddUserId] = useState('')
  const [addIsManager, setAddIsManager] = useState(false)
  const [isPending, startTransition] = useTransition()

  const memberIds = new Set(team.team_members.map((m) => m.user_id))
  const nonMembers = allUsers.filter((u) => !memberIds.has(u.id))

  function handleAdd() {
    if (!addUserId) return
    startTransition(async () => {
      const res = await addTeamMember(team.id, addUserId, addIsManager)
      if (res?.error) toast.error(res.error)
      else { toast.success('Member added.'); setAddUserId('') }
    })
  }

  function handleRemove(userId: string) {
    startTransition(async () => {
      const res = await removeTeamMember(team.id, userId)
      if (res?.error) toast.error(res.error)
      else toast.success('Member removed.')
    })
  }

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>{team.name} — Members</SheetTitle></SheetHeader>
        <SheetBody className="space-y-5">
          {/* Current members */}
          <div>
            <p className="mb-3 text-xs font-semibold text-gray-500">Current members ({team.team_members.length})</p>
            <div className="space-y-2">
              {team.team_members.map((member) => member.users && (
                <div key={member.user_id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={member.users.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px]">{getInitials(member.users.first_name, member.users.last_name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm text-gray-700">
                    {[member.users.first_name, member.users.last_name].filter(Boolean).join(' ') || member.users.email}
                  </span>
                  {member.is_manager && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                  <Button size="icon-sm" variant="ghost" onClick={() => handleRemove(member.user_id)} disabled={isPending}
                    className="text-error-600 hover:bg-error-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Add member */}
          {nonMembers.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold text-gray-500">Add member</p>
              <div className="space-y-3">
                <Select value={addUserId} onValueChange={setAddUserId}>
                  <SelectTrigger label="User">
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nonMembers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={addIsManager} onChange={(e) => setAddIsManager(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                  Set as team manager
                </label>
                <Button size="sm" onClick={handleAdd} disabled={isPending || !addUserId}>
                  {isPending ? <Loader2 className="animate-spin" /> : null}
                  Add member
                </Button>
              </div>
            </div>
          )}
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
