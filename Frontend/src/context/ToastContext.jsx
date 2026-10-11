import React, { createContext, useContext, useState, useCallback } from 'react';
const ToastContext = createContext(undefined);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);
    return (<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (<div key={toast.id} className={`px-4 py-3 rounded-md shadow-lg flex items-center justify-between min-w-[300px] ${toast.type === 'success' ? 'bg-success text-white' :
                toast.type === 'error' ? 'bg-error text-white' :
                    toast.type === 'warning' ? 'bg-warning text-white' :
                        'bg-primary-dark text-white'}`}>
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-70 hover:opacity-100">
              &times;
            </button>
          </div>))}
      </div>
    </ToastContext.Provider>);
}
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
