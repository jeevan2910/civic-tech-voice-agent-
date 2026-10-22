import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

function Sheet({ open, onOpenChange, children, className }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#181d26]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative z-50 w-full max-w-full sm:max-w-xl md:max-w-2xl bg-white border-l border-[#dddddd] shadow-2xl h-full overflow-y-auto p-4 sm:p-6 md:p-7 transition-transform duration-300 animate-in slide-in-from-right",
          className
        )}
      >
        <button
          onClick={() => onOpenChange && onOpenChange(false)}
          className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 rounded-full p-1.5 text-[#555b66] hover:bg-[#f8fafc] hover:text-[#181d26] transition-colors focus:outline-none focus:ring-1 focus:ring-[#181d26] cursor-pointer"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
}


function Dialog({ open, onOpenChange, children, className }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#181d26]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      {/* Dialog Body */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-[12px] bg-white border border-[#dddddd] shadow-2xl p-6 transition-all duration-200 animate-in zoom-in-95",
          className
        )}
      >
        <button
          onClick={() => onOpenChange && onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#41454d] hover:bg-[#f8fafc] hover:text-[#181d26] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export { Sheet, Dialog };

