import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-700',
        approved: 'bg-success-100 text-success-600',
        pending: 'bg-warning-100 text-warning-600',
        rejected: 'bg-error-100 text-error-600',
        modified: 'bg-info-100 text-info-600',
        cancelled: 'bg-gray-100 text-gray-500',
        admin: 'bg-primary-100 text-primary-700',
        user: 'bg-gray-100 text-gray-600',
        blocked: 'bg-error-100 text-error-600',
        invited: 'bg-warning-100 text-warning-600',
        active: 'bg-success-100 text-success-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
