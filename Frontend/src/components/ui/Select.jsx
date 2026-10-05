import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';
const Select = forwardRef(({ className, label, error, helperText, options, children, inputSize = 'md', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const sizeClasses = {
        sm: 'h-9 text-xs px-3',
        md: 'h-11 text-sm px-3.5',
        lg: 'h-12 text-base px-4',
    };
    return (<div className="w-full space-y-1.5">
        {label && (<label htmlFor={inputId} className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {label}
          </label>)}
        <div className="relative">
          <select id={inputId} aria-invalid={error ? 'true' : undefined} className={cn('flex w-full appearance-none rounded-control border bg-white text-ink transition-colors pr-10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-fog cursor-pointer', error
            ? 'border-status-error focus:border-status-error focus:ring-4 focus:ring-error-strong/15'
            : 'border-line-strong hover:border-ink-soft focus:border-royal focus:ring-4 focus:ring-royal/15', sizeClasses[inputSize], className)} ref={ref} {...props}>
            {options
            ? options.map((opt) => (<option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>))
            : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-soft">
            <ChevronDown className="size-4"/>
          </div>
        </div>
        {error ? (<p role="alert" className="flex items-center gap-1.5 text-caption text-error-strong font-medium">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true"/>
            {error}
          </p>) : helperText ? (<p className="text-caption text-ink-soft">{helperText}</p>) : null}
      </div>);
});
Select.displayName = 'Select';
export { Select };
