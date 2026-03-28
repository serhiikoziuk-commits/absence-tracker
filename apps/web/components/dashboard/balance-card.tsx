import { Card, CardContent } from '@/components/ui/card'

interface BalanceCardProps {
  balance: {
    total_days: number
    used_days: number
    absence_types: {
      name: string
      color: string
      icon?: string | null
    } | null
  }
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const type = balance.absence_types
  if (!type) return null

  const available = balance.total_days - balance.used_days
  const pct = balance.total_days > 0 ? (balance.used_days / balance.total_days) * 100 : 0

  return (
    <Card className="relative overflow-hidden">
      {/* Color accent top border */}
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: type.color }} />
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold"
            style={{ background: type.color }}
          >
            {type.name[0]}
          </span>
          <span className="text-sm font-medium text-gray-700 truncate">{type.name}</span>
        </div>

        <div className="mb-3">
          <span className="text-3xl font-bold tabular-nums text-gray-900">{available}</span>
          <span className="ml-1.5 text-sm text-gray-400">/ {balance.total_days} days left</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%`, background: type.color }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-gray-400">
          <span>{balance.used_days} used</span>
          <span>{balance.total_days} total</span>
        </div>
      </CardContent>
    </Card>
  )
}
