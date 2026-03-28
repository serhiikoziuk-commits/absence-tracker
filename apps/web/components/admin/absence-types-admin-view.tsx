'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { createAbsenceType, updateAbsenceType, deleteAbsenceType } from '@/lib/actions/admin'

const PRESET_COLORS = ['#6366F1','#F43F5E','#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#64748B','#EC4899','#14B8A6']

interface AbsenceType {
  id: string
  name: string
  color: string
  default_days: number
  accrual_type: string
  accrual_amount: number
  requires_attachment: boolean
  is_active: boolean
}

interface AbsenceTypesAdminViewProps {
  absenceTypes: AbsenceType[]
}

export function AbsenceTypesAdminView({ absenceTypes }: AbsenceTypesAdminViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AbsenceType | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleToggleActive(type: AbsenceType) {
    startTransition(async () => {
      const res = await updateAbsenceType(type.id, { is_active: !type.is_active })
      if (res?.error) toast.error(res.error)
    })
  }

  function handleDelete(typeId: string) {
    startTransition(async () => {
      const res = await deleteAbsenceType(typeId)
      if (res?.error) toast.error(res.error)
      else toast.success('Absence type deleted.')
    })
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" />
          Add type
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {absenceTypes.map((type) => (
          <div
            key={type.id}
            className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-3.5 ${!type.is_active ? 'opacity-50' : ''}`}
          >
            {/* Color dot */}
            <div className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: type.color }} />

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{type.name}</p>
              <p className="text-xs text-gray-400">
                {type.default_days} days · {type.accrual_type === 'none' ? 'No accrual' : `${type.accrual_amount}d/${type.accrual_type}`}
                {type.requires_attachment && ' · Attachment required'}
              </p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{type.is_active ? 'Active' : 'Inactive'}</span>
              <Switch
                checked={type.is_active}
                onCheckedChange={() => handleToggleActive(type)}
                disabled={isPending}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(type); setDialogOpen(true) }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(type.id)} disabled={isPending}
                className="text-error-600 hover:bg-error-100">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {absenceTypes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400">No absence types configured.</p>
          </div>
        )}
      </div>

      <AbsenceTypeDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        editing={editing}
      />
    </>
  )
}

function AbsenceTypeDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: AbsenceType | null }) {
  const [name, setName] = useState(editing?.name ?? '')
  const [color, setColor] = useState(editing?.color ?? PRESET_COLORS[0])
  const [defaultDays, setDefaultDays] = useState(String(editing?.default_days ?? 0))
  const [accrualType, setAccrualType] = useState(editing?.accrual_type ?? 'none')
  const [accrualAmount, setAccrualAmount] = useState(String(editing?.accrual_amount ?? 0))
  const [requiresAttachment, setRequiresAttachment] = useState(editing?.requires_attachment ?? false)
  const [isPending, startTransition] = useTransition()

  // Reset when editing changes
  const resetAndClose = () => {
    setName(''); setColor(PRESET_COLORS[0]); setDefaultDays('0')
    setAccrualType('none'); setAccrualAmount('0'); setRequiresAttachment(false)
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      name,
      color,
      default_days: parseFloat(defaultDays) || 0,
      accrual_type: accrualType as 'none' | 'monthly' | 'yearly',
      accrual_amount: parseFloat(accrualAmount) || 0,
      requires_attachment: requiresAttachment,
    }

    startTransition(async () => {
      const res = editing
        ? await updateAbsenceType(editing.id, data)
        : await createAbsenceType(data)

      if (res?.error) toast.error(res.error)
      else {
        toast.success(editing ? 'Absence type updated.' : 'Absence type created.')
        resetAndClose()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit absence type' : 'New absence type'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="e.g. Vacation" />

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Default days/year"
              type="number"
              min="0"
              step="0.5"
              value={defaultDays}
              onChange={(e) => setDefaultDays(e.target.value)}
            />
            <Select value={accrualType} onValueChange={setAccrualType}>
              <SelectTrigger label="Accrual">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No accrual</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {accrualType !== 'none' && (
            <Input
              label={`Days to accrue per ${accrualType === 'monthly' ? 'month' : 'year'}`}
              type="number"
              min="0"
              step="0.5"
              value={accrualAmount}
              onChange={(e) => setAccrualAmount(e.target.value)}
            />
          )}

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresAttachment}
              onChange={(e) => setRequiresAttachment(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm text-gray-700">Require attachment (e.g. medical certificate)</span>
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !name}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {editing ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
