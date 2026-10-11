import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
const ToastContext = createContext(undefined);
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const toast = useCallback(({ title, message, variant, duration = 5000 }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, message, variant, duration: variant === 'error' ? 0 : duration }]);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    return (<ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
          {toasts.map((t) => (<ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)}/>))}
        </div>, document.body)}
    </ToastContext.Provider>);
}
function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onRemove, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onRemove]);
    const dotColor = {
        success: 'bg-status-success',
        error: 'bg-status-error',
        warning: 'bg-status-warning',
        info: 'bg-sky',
    }[toast.variant];
    return (<div role="status" aria-live="polite" className={cn('pointer-events-auto flex items-center gap-3 rounded-modal border border-white/10 bg-panel px-5 py-3.5 shadow-pop transition-all animate-fade-up')}>
      <span className={cn('size-2 rounded-full shrink-0', dotColor)}/>
      <div className="flex-1 text-sm text-on-dark font-medium">
        {toast.title && <div className="font-semibold text-white">{toast.title}</div>}
        <div>{toast.message}</div>
      </div>
      <button onClick={onRemove} className="shrink-0 p-1 text-on-dark-soft hover:text-white transition-colors" aria-label="Close notification">
        <X className="size-4"/>
      </button>
    </div>);
}
