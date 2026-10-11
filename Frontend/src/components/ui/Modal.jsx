import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Modal({ isOpen, onClose, title, children, footer, size = 'md', className }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-form',
        lg: 'max-w-xl',
        xl: 'max-w-2xl',
        full: 'max-w-[calc(100%-2rem)] h-[calc(100%-2rem)]',
    };
    const modalContent = (<div role="dialog" aria-modal="true" className={cn("fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4", className)}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"/>

      {/* Modal Surface */}
      <div className={cn('relative bg-white rounded-t-modal sm:rounded-modal shadow-pop flex flex-col w-full max-h-[90vh] z-10 border border-line-mid overflow-hidden', sizeClasses[size])}>
        {title && (<div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h2 className="text-h4 font-semibold text-ink tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-control text-ink-soft hover:text-ink hover:bg-fog transition-colors" aria-label="Close dialog">
              <X size={18}/>
            </button>
          </div>)}
        <div className="p-6 overflow-y-auto flex-1 text-body">
          {children}
        </div>
        {footer && (<div className="flex items-center justify-end px-6 py-4 border-t border-line bg-surface-sunken gap-3">
            {footer}
          </div>)}
      </div>
    </div>);
    return typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null;
}
