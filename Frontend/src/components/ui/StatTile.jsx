import React from 'react';
import { cn } from '@/lib/utils';
export function StatTile({ label, value, delta, variant = 'light', className }) {
    const isDark = variant === 'dark';
    return (<div className={cn("flex-1 rounded-card p-4 transition-all duration-150", isDark
            ? "border border-white/10 bg-white/5 backdrop-blur-sm"
            : "border border-line-mid bg-white shadow-card", className)}>
      <p className={cn("text-eyebrow font-semibold uppercase tracking-[0.16em]", isDark ? "text-on-dark-label" : "text-ink-soft")}>
        {label}
      </p>
      <p className={cn("num mt-1 text-h3 font-bold tracking-tight", isDark ? "text-on-dark" : "text-ink")}>
        {value}
        {delta && (<span className={cn("ml-2 text-caption font-semibold", isDark ? "text-sky-bright" : "text-royal")}>
            {delta}
          </span>)}
      </p>
    </div>);
}
