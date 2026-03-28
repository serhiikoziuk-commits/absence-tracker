'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitRequest } from '@/lib/actions/requests'

interface SubmitRequestDialogProps {
  open: boolean
  onClose: () => void
  absenceTypes: { id: string; name: string; color: string }[]
  balances: { absence_type_id: string; total_days: number; used_days: number }[]
}

export function SubmitRequestDialog({ open, onClose, absenceTypes, balances }: SubmitRequestDialogProps) {
  const [typeId, setTypeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()

  const selectedBalance = balances.find((b) => b.absence_type_id === typeId)
  const available = selectedBalance ? selectedBalance.total_days - selectedBalance.used_days : null

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('absence_type_id', typeId)
    fd.append('start_date', startDate)
    fd.append('end_date', endDate)
    if (comment) fd.append('comment', comment)

    startTransition(async () => {
      const res = await submitRequest(fd)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Request submitted successfully.')
        onClose()
        setTypeId(''); setStartDate(''); setEndDate(''); setComment('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New absence request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <Select value={typeId} onValueChange={setTypeId}>
            <SelectTrigger label="Absence type">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {absenceTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {typeId && available !== null && (
            <p className="text-xs text-gray-500">
              Available this year: <span className="font-medium text-gray-700">{available} days</span>
            </p>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start date"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End date"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {/* Comment */}
          <Textarea
            label="Note (optional)"
            placeholder="Add a note for your manager..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !typeId || !startDate || !endDate}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
