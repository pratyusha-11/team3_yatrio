import React from 'react';
import { cva } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
const alertVariants = cva('relative flex gap-3 w-full rounded-card border p-4 transition-all duration-150', {
    variants: {
        variant: {
            info: 'border-azure/25 bg-blue-100 text-body [&>svg]:text-royal',
            success: 'border-status-success/30 bg-status-success/8 text-body [&>svg]:text-success-strong',
            warning: 'border-status-warning/30 bg-status-warning/8 text-body [&>svg]:text-warning-strong',
            error: 'border-status-error/30 bg-status-error/8 text-body [&>svg]:text-error-strong',
            demo: 'border-azure/30 bg-blue-100 text-body [&>svg]:text-royal',
        },
    },
    defaultVariants: {
        variant: 'info',
    },
});
export function Alert({ className, variant, title, description, children, onDismiss, ...props }) {
    const Icon = {
        info: Info,
        success: CheckCircle2,
        warning: AlertTriangle,
        error: AlertCircle,
        demo: Info,
    }[variant || 'info'];
    return (<div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="size-5 shrink-0 mt-0.5" aria-hidden="true"/>
      <div className="flex-1 flex flex-col gap-0.5">
        {title && (<h5 className={cn("text-sm font-semibold leading-tight", variant === 'error' ? 'text-error-strong' :
                variant === 'warning' ? 'text-warning-strong' :
                    variant === 'success' ? 'text-success-strong' :
                        'text-ink')}>
            {title}
          </h5>)}
        {(description || children) && (<div className="text-caption text-body leading-relaxed">
            {description}
            {children}
          </div>)}
      </div>
      {onDismiss && (<button onClick={onDismiss} className="shrink-0 p-1 text-ink-soft hover:text-ink rounded-control transition-colors" aria-label="Dismiss alert">
          <X className="size-4"/>
        </button>)}
    </div>);
}
