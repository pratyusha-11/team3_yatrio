import React from 'react';
import { cn } from '@/lib/utils';
export function Skeleton({ className, ...props }) {
    return (<div className={cn('animate-shimmer rounded-control bg-[linear-gradient(90deg,#E9EEF4_0%,#F7F9FC_50%,#E9EEF4_100%)] bg-[length:200%_100%]', className)} {...props}/>);
}
export function SkeletonText({ className, lines = 1 }) {
    return (<div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (<Skeleton key={i} className={cn('h-4 w-full rounded-full', i === lines - 1 && lines > 1 ? 'w-2/3' : '')}/>))}
    </div>);
}
export function SkeletonCard({ className }) {
    return (<div className={cn('rounded-card border border-line-mid bg-white p-5 space-y-4 shadow-card', className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="size-11 rounded-full"/>
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3 rounded-full"/>
          <Skeleton className="h-3 w-1/4 rounded-full"/>
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-control"/>
    </div>);
}
export function SkeletonAvatar({ className, size = 'md' }) {
    const sizeClasses = {
        sm: 'size-8',
        md: 'size-10',
        lg: 'size-12',
        xl: 'size-16',
    };
    return <Skeleton className={cn('rounded-full', sizeClasses[size], className)}/>;
}
export function SkeletonTable({ rows = 5, columns = 4, className }) {
    return (<div className={cn('w-full border border-line-mid rounded-card overflow-hidden bg-white', className)}>
      <div className="flex bg-surface-sunken p-4 border-b border-line-mid">
        {Array.from({ length: columns }).map((_, i) => (<Skeleton key={i} className="h-4 flex-1 mx-2 rounded-full"/>))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (<div key={i} className="flex p-4 border-b border-line last:border-0">
          {Array.from({ length: columns }).map((_, j) => (<Skeleton key={j} className="h-4 flex-1 mx-2 rounded-full"/>))}
        </div>))}
    </div>);
}
