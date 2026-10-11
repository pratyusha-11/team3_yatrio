import React from 'react';
import { cn } from '@/lib/utils';
export function EmptyState({ icon, title, description, action, className }) {
    return (<div className={cn("flex flex-col items-center justify-center rounded-card border border-dashed border-line-mid bg-white px-6 py-16 text-center", className)}>
      {icon ? (<div className="mb-4 text-ink-soft/40 p-3 rounded-full bg-surface-sunken">
          {icon}
        </div>) : (<div className="size-16 rounded-[22%] bg-navy/5 flex items-center justify-center mb-4 text-navy/30">
          <svg viewBox="0 0 32 32" className="size-8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L16 19V28H20V19L30 6H24L18 14.5L12 6H6Z" fill="currentColor"/>
          </svg>
        </div>)}
      <h3 className="text-h4 font-semibold text-ink mb-1.5">{title}</h3>
      {description && (<p className="text-body text-ink-soft max-w-prose mb-6">
          {description}
        </p>)}
      {action && <div>{action}</div>}
    </div>);
}
