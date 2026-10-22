import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#181d26] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.99]";

  const variants = {
    // Primary CTA: Near-black ink #181d26, active #0d1218
    default: "bg-[#181d26] text-white hover:bg-[#0d1218] active:bg-[#0d1218] shadow-xs",
    primary: "bg-[#181d26] text-white hover:bg-[#0d1218] active:bg-[#0d1218] shadow-xs",
    
    // Secondary: White canvas with 1px hairline border #dddddd
    secondary: "bg-white text-[#181d26] border border-[#dddddd] hover:bg-[#f8fafc] active:bg-[#e0e2e6]",
    outline: "bg-white text-[#181d26] border border-[#dddddd] hover:bg-[#f8fafc] active:bg-[#e0e2e6]",
    
    // Secondary-on-dark: White button on dark/coral/forest surfaces
    "secondary-on-dark": "bg-white text-[#181d26] hover:bg-[#f8fafc] active:bg-[#e0e2e6] shadow-sm",
    
    // Ghost & Link
    ghost: "text-[#333840] hover:bg-[#f8fafc] hover:text-[#181d26]",
    link: "text-[#1b61c9] hover:text-[#1a3866] underline-offset-4 hover:underline p-0 h-auto font-medium",
    
    // Semantic Danger & Success
    danger: "bg-[#aa2d00] text-white hover:bg-[#852300] active:bg-[#852300] shadow-xs",
    success: "bg-[#006400] text-white hover:bg-[#061e09] active:bg-[#061e09] shadow-xs",
    
    // Signature Cream Callout button
    cream: "bg-[#f5e9d4] text-[#181d26] border border-[#dddddd] hover:bg-[#ebdcc2]",
    
    // Pricing Pill Button
    pill: "bg-white text-[#1d1f25] border border-[#dddddd] rounded-full hover:bg-[#f8fafc]"
  };

  const sizes = {
    default: "h-9 px-3.5 py-2 text-xs",
    sm: "h-8 rounded-[6px] px-2.5 text-[11px] font-medium",
    lg: "h-10 rounded-[8px] px-5 text-sm font-medium",
    icon: "h-9 w-9 p-0 rounded-full border border-[#dddddd] bg-white text-[#181d26] hover:bg-[#f8fafc]",
    "icon-sm": "h-7.5 w-7.5 p-0 rounded-full border border-[#dddddd] bg-white text-[#181d26] hover:bg-[#f8fafc]",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export { Button };


