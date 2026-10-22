import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative inline-block w-full">
      <select
        ref={ref}
        className={cn(
          "flex h-9.5 w-full appearance-none rounded-[6px] border border-[#dddddd] bg-white px-3 py-1.5 pr-8 text-xs text-[#181d26] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#181d26] focus-visible:border-[#181d26] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-normal",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-[#555b66]" />
    </div>
  );
});
Select.displayName = "Select";

export { Select };


