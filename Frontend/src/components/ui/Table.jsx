import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
const Table = forwardRef(({ className, ...props }, ref) => (<div className="w-full overflow-hidden rounded-card border border-line-mid bg-white">
      <div className="overflow-x-auto w-full">
        <table ref={ref} className={cn('w-full border-collapse text-left text-sm', className)} {...props}/>
      </div>
    </div>));
Table.displayName = 'Table';
const TableHeader = forwardRef(({ className, ...props }, ref) => (<thead ref={ref} className={cn('bg-surface-sunken border-b border-line-mid', className)} {...props}/>));
TableHeader.displayName = 'TableHeader';
const TableBody = forwardRef(({ className, ...props }, ref) => (<tbody ref={ref} className={cn('divide-y divide-line', className)} {...props}/>));
TableBody.displayName = 'TableBody';
const TableRow = forwardRef(({ className, ...props }, ref) => (<tr ref={ref} className={cn('transition-colors hover:bg-surface-sunken/70', className)} {...props}/>));
TableRow.displayName = 'TableRow';
const TableHead = forwardRef(({ className, ...props }, ref) => (<th ref={ref} scope="col" className={cn('px-5 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft select-none', className)} {...props}/>));
TableHead.displayName = 'TableHead';
const TableCell = forwardRef(({ className, ...props }, ref) => (<td ref={ref} className={cn('px-5 py-4 text-body text-ink align-middle', className)} {...props}/>));
TableCell.displayName = 'TableCell';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, };
