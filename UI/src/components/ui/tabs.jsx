import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

const TabsContext = createContext();

function Tabs({ value, defaultValue, onValueChange, className, children, ...props }) {
  const [currentTab, setCurrentTab] = useState(value || defaultValue);

  const activeValue = value !== undefined ? value : currentTab;
  const handleTabChange = (val) => {
    if (value === undefined) setCurrentTab(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <TabsContext.Provider value={{ currentTab: activeValue, setCurrentTab: handleTabChange }}>
      <div className={cn("w-full space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-[10px] bg-[#f8fafc] border border-[#dddddd] p-1 text-[#41454d]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children, ...props }) {
  const { currentTab, setCurrentTab } = useContext(TabsContext);
  const isActive = currentTab === value;

  return (
    <button
      type="button"
      onClick={() => setCurrentTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] px-4 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#181d26] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive
          ? "bg-white text-[#181d26] shadow-xs border border-[#dddddd]/70 font-semibold"
          : "text-[#41454d] hover:text-[#181d26] hover:bg-white/60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }) {
  const { currentTab } = useContext(TabsContext);
  if (currentTab !== value) return null;

  return (
    <div
      className={cn(
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#181d26] animate-in fade-in duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

