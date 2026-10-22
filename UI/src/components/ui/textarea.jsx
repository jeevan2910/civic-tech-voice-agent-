import React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-[6px] border border-[#dddddd] bg-white px-3.5 py-2.5 text-sm text-[#181d26] placeholder:text-[#9297a0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#181d26] focus-visible:border-[#181d26] disabled:cursor-not-allowed disabled:opacity-50 font-normal leading-relaxed",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

