import React from 'react';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef(({ className, value = 0, color = 'default', ...props }, ref) => {
  const colorMap = {
    default: 'bg-[#181d26]',
    critical: 'bg-[#aa2d00]',
    high: 'bg-[#ea580c]',
    medium: 'bg-[#d9a441]',
    low: 'bg-[#006400]',
    blue: 'bg-[#1b61c9]'
  };

  const barColor = colorMap[color] || colorMap.default;

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[#e0e2e6]",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 transition-all duration-300 rounded-full", barColor)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };

