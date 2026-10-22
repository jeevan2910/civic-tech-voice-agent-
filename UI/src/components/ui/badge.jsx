import React from 'react';
import { cn } from '@/lib/utils';

function Badge({
  className,
  variant = "default",
  ...props
}) {
  const variants = {
    default: "bg-[#f8fafc] text-[#333840] border-[#dddddd]",
    critical: "bg-[#fef2f2] text-[#aa2d00] border-[#fecaca] font-semibold",
    high: "bg-[#fff7ed] text-[#ea580c] border-[#ffedd5] font-semibold",
    medium: "bg-[#fefce8] text-[#d9a441] border-[#fef08a] font-semibold",
    low: "bg-[#f0fdf4] text-[#006400] border-[#bbf7d0] font-semibold",
    amber: "bg-[#fef6ea] text-[#d9a441] border-[#dddddd] font-semibold",
    blue: "bg-[#eff6ff] text-[#1b61c9] border-[#bfdbfe] font-medium",
    purple: "bg-[#faf5ff] text-[#9333ea] border-[#e9d5ff] font-medium",
    outline: "border border-[#dddddd] text-[#333840] bg-white",
    
    // Signature Cards as Badges
    coral: "bg-[#aa2d00] text-white border-transparent font-medium",
    forest: "bg-[#0a2e0e] text-white border-transparent font-medium",
    cream: "bg-[#f5e9d4] text-[#181d26] border-[#dddddd] font-medium",
    peach: "bg-[#fcab79] text-[#181d26] border-transparent font-medium",
    mint: "bg-[#a8d8c4] text-[#0a2e0e] border-transparent font-medium",
    dark: "bg-[#181d26] text-white border-transparent font-medium"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] transition-colors font-medium tracking-tight whitespace-nowrap",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };


