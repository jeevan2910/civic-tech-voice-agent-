import React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[#f8fafc] text-[#181d26] border-[#dddddd]",
    critical: "bg-[#fef2f2] text-[#aa2d00] border-[#fecaca]",
    warning: "bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]",
    info: "bg-[#eff6ff] text-[#1b61c9] border-[#bfdbfe]",
    success: "bg-[#f0fdf4] text-[#006400] border-[#bbf7d0]",
    cream: "bg-[#f5e9d4] text-[#181d26] border-[#dddddd]",
    amber: "bg-[#fef6ea] text-[#d9a441] border-[#f4d35e]/60"
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-[10px] border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current shadow-xs",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium text-sm leading-tight tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-normal [&_p]:leading-relaxed opacity-95", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

