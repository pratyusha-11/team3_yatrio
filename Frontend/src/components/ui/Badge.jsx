import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-semibold transition-colors select-none', {
    variants: {
        variant: {
            default: 'border border-line-mid bg-surface-sunken text-body',
            success: 'border border-status-success/30 bg-status-success/12 text-success-strong',
            confirmed: 'border border-status-success/30 bg-status-success/12 text-success-strong',
            active: 'border border-status-success/30 bg-status-success/12 text-success-strong',
            warning: 'border border-status-warning/30 bg-status-warning/14 text-warning-strong',
            rac: 'border border-status-warning/30 bg-status-warning/14 text-warning-strong',
            delayed: 'border border-status-error/30 bg-status-error/12 text-error-strong',
            error: 'border border-status-error/30 bg-status-error/12 text-error-strong',
            cancelled: 'border border-status-error/30 bg-status-error/12 text-error-strong',
            info: 'border border-sky/35 bg-sky/12 text-royal',
            waiting: 'border border-status-warning/30 bg-status-warning/14 text-warning-strong',
            inactive: 'border border-line-mid bg-fog text-ink-soft',
            primary: 'border border-royal/30 bg-royal/10 text-royal',
            secondary: 'border border-azure/30 bg-blue-100 text-royal',
            outline: 'border border-line-strong bg-white text-body',
        },
        size: {
            sm: 'text-caption py-0.5 px-2.5',
            md: 'text-sm py-1 px-3',
        },
        pill: {
            true: 'rounded-full',
            false: 'rounded-control',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'sm',
        pill: true,
    },
});
function Badge({ className, variant, size, pill, showDot, pulseDot, children, ...props }) {
    const dotColorClass = {
        success: 'bg-status-success',
        confirmed: 'bg-status-success',
        active: 'bg-status-success',
        warning: 'bg-status-warning',
        rac: 'bg-status-warning',
        waiting: 'bg-status-warning',
        delayed: 'bg-status-error',
        error: 'bg-status-error',
        cancelled: 'bg-status-error',
        info: 'bg-sky',
        primary: 'bg-royal',
        secondary: 'bg-azure',
        default: 'bg-ink-soft',
        inactive: 'bg-ink-soft',
        outline: 'bg-ink-soft',
    }[variant || 'default'];
    return (<div className={cn(badgeVariants({ variant, size, pill }), className)} {...props}>
      {showDot && (<span className={cn('size-1.5 rounded-full shrink-0', dotColorClass, pulseDot && 'animate-pulse')} aria-hidden="true"/>)}
      <span>{children}</span>
    </div>);
}
export { Badge, badgeVariants };
