import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-[filter,background-color,border-color,color,transform] duration-150 ease-brand disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer', {
    variants: {
        variant: {
            primary: 'bg-gradient-to-r from-royal to-azure text-white shadow-button hover:brightness-110 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky',
            primaryInverted: 'bg-white text-royal shadow-raised hover:bg-fog focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal',
            secondary: 'border border-line-strong bg-white text-ink shadow-sm hover:bg-fog focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal',
            outline: 'border border-line-strong bg-white text-ink shadow-sm hover:bg-fog focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal',
            ghost: 'text-royal hover:bg-royal/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal',
            danger: 'border border-error-strong/30 bg-error-strong/8 text-error-strong hover:bg-error-strong/14 focus-visible:outline-2 focus-visible:outline-error-strong',
            error: 'border border-error-strong/30 bg-error-strong/8 text-error-strong hover:bg-error-strong/14 focus-visible:outline-2 focus-visible:outline-error-strong',
            darkSecondary: 'border border-white/20 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky',
            accent: 'bg-azure text-white shadow-button hover:brightness-110 active:translate-y-px focus-visible:outline-2 focus-visible:outline-sky',
        },
        size: {
            sm: 'h-9 px-3.5 text-caption font-semibold',
            md: 'h-11 px-5 text-sm font-semibold',
            lg: 'h-12 px-6 text-body font-semibold',
            icon: 'size-11 p-0 justify-center',
            iconSm: 'size-9 p-0 justify-center',
        },
        fullWidth: {
            true: 'w-full',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
        fullWidth: false,
    },
});
const Button = forwardRef(({ className, variant, size, fullWidth, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (<button className={cn(buttonVariants({ variant, size, fullWidth, className }))} ref={ref} disabled={disabled || isLoading} {...props}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin"/>}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>);
});
Button.displayName = 'Button';
export { Button, buttonVariants };
