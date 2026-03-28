'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, User, Bell, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { updateProfile, updatePushNotifications } from '@/lib/actions/profile'
import { getInitials } from '@/lib/utils'
import type { UserWithTeams } from '@/app/[workspace]/profile/page'

interface ProfileFormProps {
  user: UserWithTeams
  workspaceSlug: string
}

export function ProfileForm({ user, workspaceSlug }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(user.first_name ?? '')
  const [lastName, setLastName] = useState(user.last_name ?? '')
  const [jobTitle, setJobTitle] = useState(user.job_title ?? '')
  const [dob, setDob] = useState(user.date_of_birth ?? '')
  const [pushEnabled, setPushEnabled] = useState(user.push_notifications_enabled)
  const [isPending, startTransition] = useTransition()

  const teams = user.teams?.map((t) => t.teams?.name).filter(Boolean) ?? []

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('first_name', firstName)
    fd.append('last_name', lastName)
    fd.append('job_title', jobTitle)
    fd.append('date_of_birth', dob)

    startTransition(async () => {
      const res = await updateProfile(fd)
      if (res?.error) toast.error(res.error)
      else toast.success('Profile updated.')
    })
  }

  function handleTogglePush(checked: boolean) {
    setPushEnabled(checked)
    startTransition(async () => {
      const res = await updatePushNotifications(checked)
      if (res?.error) { toast.error(res.error); setPushEnabled(!checked) }
    })
  }

  return (
    <div className="space-y-5">
      {/* Avatar + basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            Personal information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar section */}
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">{getInitials(firstName, lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-700">Profile photo</p>
              <p className="text-xs text-gray-400 mt-0.5">Avatar upload coming soon.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isPending}
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={user.email}
              disabled
              helper="Email cannot be changed."
            />
            <Input
              label="Job title"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isPending}
            />
            <Input
              label="Date of birth (shown in team birthday calendar)"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !firstName}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team & Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-gray-400" />
            Workspace info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Role</span>
            <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>
              {user.role === 'admin' ? 'Admin' : 'Member'}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Teams</span>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {teams.length > 0 ? (
                teams.map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{t}</span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No team assigned</span>
              )}
            </div>
          </div>
          {user.start_date && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start date</span>
                <span className="text-sm text-gray-700">
                  {new Date(user.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4 text-gray-400" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Push notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">Receive alerts on your mobile app.</p>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} disabled={isPending} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
