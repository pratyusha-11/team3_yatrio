import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
const TabsContext = createContext(null);
export function Tabs({ tabs, activeTab, onChange, value: controlledValue, defaultValue = '', onValueChange, variant = 'underline', className, children, }) {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const currentTab = controlledValue !== undefined ? controlledValue : (activeTab !== undefined ? activeTab : uncontrolledValue);
    const handleTabChange = (val) => {
        if (onValueChange)
            onValueChange(val);
        if (onChange)
            onChange(val);
        setUncontrolledValue(val);
    };
    if (children) {
        return (<TabsContext.Provider value={{ value: currentTab, onValueChange: handleTabChange }}>
        <div className={cn('w-full', className)}>{children}</div>
      </TabsContext.Provider>);
    }
    if (!tabs)
        return null;
    return (<div className={cn('w-full overflow-x-auto no-scrollbar', className)}>
      <div role="tablist" className={cn('flex gap-6 border-b border-line-mid', variant === 'segmented' ? 'p-1 gap-1 bg-surface-sunken rounded-control border-none' : '')}>
        {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (<button key={tab.id} role="tab" aria-selected={isActive} onClick={() => handleTabChange(tab.id)} className={cn('whitespace-nowrap pb-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal cursor-pointer', isActive
                    ? 'border-b-2 border-azure font-semibold text-ink'
                    : 'border-b-2 border-transparent font-medium text-ink-soft hover:text-ink', variant === 'segmented' && [
                    'border-b-0 py-2 px-4 rounded-control font-medium',
                    isActive ? 'bg-white shadow-card text-ink font-semibold' : 'text-ink-soft hover:text-ink'
                ])}>
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count !== undefined && (<Badge variant={isActive ? 'primary' : 'default'} size="sm">
                    {tab.count}
                  </Badge>)}
              </span>
            </button>);
        })}
      </div>
    </div>);
}
export function TabsList({ className, children }) {
    return (<div role="tablist" className={cn('flex gap-6 border-b border-line-mid w-full', className)}>
      {children}
    </div>);
}
export function TabsTrigger({ value, className, children, }) {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;
    return (<button type="button" role="tab" aria-selected={isActive} onClick={() => context?.onValueChange(value)} className={cn('pb-3 text-sm transition-all focus-visible:outline-none cursor-pointer', isActive
            ? 'border-b-2 border-azure font-semibold text-ink'
            : 'border-b-2 border-transparent font-medium text-ink-soft hover:text-ink', className)}>
      {children}
    </button>);
}
export function TabsContent({ value, className, children, }) {
    const context = useContext(TabsContext);
    if (context?.value !== value)
        return null;
    return <div className={cn('pt-4 focus-visible:outline-none', className)}>{children}</div>;
}
