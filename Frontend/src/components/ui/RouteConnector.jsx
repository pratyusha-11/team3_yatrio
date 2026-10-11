import React from 'react';
import { cn } from '@/lib/utils';
export function RouteConnector({ fromCode, toCode, fromName, toName, depTime, arrTime, duration, delay, className, size = 'md', }) {
    const codeSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-h3',
    };
    return (<div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {/* Code and Arrow Connector */}
      <div className="flex items-center gap-3 w-full">
        <span className={cn("num font-bold tracking-tight text-ink shrink-0", codeSizes[size])}>
          {fromCode}
        </span>
        <div className="relative h-0.5 flex-1 bg-gradient-to-r from-royal to-sky after:absolute after:-right-px after:-top-[3.5px] after:border-y-[4.5px] after:border-r-[7px] after:border-y-transparent after:border-r-sky">
          {duration && (<span className="absolute -top-6 left-1/2 -translate-x-1/2 text-caption font-medium text-ink-soft bg-paper px-2 py-0.5 rounded-full border border-line whitespace-nowrap">
              {duration}
            </span>)}
        </div>
        <span className={cn("num font-bold tracking-tight text-ink shrink-0", codeSizes[size])}>
          {toCode}
        </span>
      </div>

      {/* Optional Station Names and Timings */}
      {(depTime || arrTime || fromName || toName) && (<div className="flex justify-between items-start text-left w-full text-caption">
          <div>
            {depTime && (<div className="num font-semibold text-body text-ink text-sm flex items-center gap-1.5">
                {depTime}
                {delay && Number(delay) > 0 && (<span className="text-caption font-semibold text-error-strong">
                    +{delay}m
                  </span>)}
              </div>)}
            {fromName && <div className="text-ink-soft truncate max-w-[120px]">{fromName}</div>}
          </div>
          <div className="text-right">
            {arrTime && (<div className="num font-semibold text-body text-ink text-sm">
                {arrTime}
              </div>)}
            {toName && <div className="text-ink-soft truncate max-w-[120px]">{toName}</div>}
          </div>
        </div>)}
    </div>);
}
