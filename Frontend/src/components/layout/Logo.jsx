import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
export function Logo({ size = 'md', variant = 'light', className, showTagline = false }) {
    const isDark = variant === 'dark';
    const iconSizes = {
        sm: 'h-7 w-7',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        full: 'h-12 w-12',
    };
    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        full: 'text-3xl',
    };
    return (<Link to="/" className={cn("inline-flex items-center gap-2.5 group select-none", className)} aria-label="Yatrio home">
      {/* Yatrio Geometric Brand Monogram */}
      <div className={cn("flex shrink-0 items-center justify-center rounded-[22%] transition-transform duration-200 group-hover:scale-105 shadow-sm", iconSizes[size], isDark
            ? "bg-gradient-to-br from-royal to-azure text-white"
            : "bg-navy text-white shadow-card")}>
        <svg viewBox="0 0 32 32" className="w-[60%] h-[60%]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Geometric Y Rail Monogram */}
          <path d="M6 6L16 19V28H20V19L30 6H24L18 14.5L12 6H6Z" fill="currentColor"/>
          <path d="M21 16L27 6H31L23 18.5L21 16Z" fill={isDark ? "#3BB3FD" : "#0080F8"}/>
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={cn("font-bold tracking-tight font-display transition-colors", textSizes[size], isDark ? "text-white" : "text-navy")}>
          Yatrio
        </span>
        {showTagline && (<span className={cn("text-eyebrow font-semibold uppercase tracking-[0.16em] mt-0.5", isDark ? "text-on-dark-label" : "text-ink-soft")}>
            Move Beyond Limits
          </span>)}
      </div>
    </Link>);
}
