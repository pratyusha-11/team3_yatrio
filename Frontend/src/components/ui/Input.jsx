import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
const Input = forwardRef(({ className, type, label, error, helperText, leftIcon, rightIcon, inputSize = 'md', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
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
          {leftIcon && (<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft">
              {leftIcon}
            </div>)}
          <input id={inputId} type={inputType} aria-invalid={error ? 'true' : undefined} className={cn('flex w-full rounded-control border bg-white text-ink transition-colors placeholder:text-ink-soft/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-fog', error
            ? 'border-status-error focus:border-status-error focus:ring-4 focus:ring-error-strong/15'
            : 'border-line-strong hover:border-ink-soft focus:border-royal focus:ring-4 focus:ring-royal/15', leftIcon ? 'pl-10' : '', (rightIcon || isPassword) ? 'pr-10' : '', sizeClasses[inputSize], className)} ref={ref} {...props}/>
          {isPassword ? (<button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft hover:text-ink focus:outline-none" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>) : rightIcon ? (<div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink-soft">
              {rightIcon}
            </div>) : null}
        </div>
        {error ? (<p role="alert" className="flex items-center gap-1.5 text-caption text-error-strong font-medium">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true"/>
            {error}
          </p>) : helperText ? (<p className="text-caption text-ink-soft">{helperText}</p>) : null}
      </div>);
});
Input.displayName = 'Input';
export { Input };
