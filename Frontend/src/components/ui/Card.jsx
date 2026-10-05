import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
const cardVariants = cva('rounded-card text-body transition-all duration-150', {
    variants: {
        variant: {
            default: 'border border-line-mid bg-white shadow-card',
            elevated: 'border border-line-mid bg-white shadow-raised',
            bordered: 'border border-line-mid bg-white',
            interactive: 'border border-line-mid bg-white shadow-card hover:-translate-y-0.5 hover:border-royal/30 hover:shadow-raised cursor-pointer',
            dark: 'border border-white/10 bg-panel text-on-dark',
            sunken: 'rounded-control bg-surface-sunken border border-line',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
const Card = forwardRef(({ className, variant, ...props }, ref) => (<div ref={ref} className={cn(cardVariants({ variant, className }))} {...props}/>));
Card.displayName = 'Card';
const CardHeader = forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('flex flex-col space-y-1.5 p-5 pb-3', className)} {...props}/>));
CardHeader.displayName = 'CardHeader';
const CardTitle = forwardRef(({ className, ...props }, ref) => (<h3 ref={ref} className={cn('text-h4 font-semibold text-ink leading-tight', className)} {...props}/>));
CardTitle.displayName = 'CardTitle';
const CardDescription = forwardRef(({ className, ...props }, ref) => (<p ref={ref} className={cn('text-caption text-ink-soft', className)} {...props}/>));
CardDescription.displayName = 'CardDescription';
const CardContent = forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('p-5 pt-0', className)} {...props}/>));
CardContent.displayName = 'CardContent';
const CardFooter = forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('flex items-center p-5 pt-0 border-t border-line mt-4', className)} {...props}/>));
CardFooter.displayName = 'CardFooter';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
