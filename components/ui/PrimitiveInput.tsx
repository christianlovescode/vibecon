import React from 'react';
import { cn } from '@/lib/utils';

interface PrimitiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PrimitiveInput = React.forwardRef<HTMLInputElement, PrimitiveInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 text-base',
              'bg-white text-gray-900',
              'border-4 border-[#1e7ae8] rounded-xl',
              'focus:outline-none focus:ring-2 focus:ring-[#1e7ae8] focus:ring-offset-2',
              'placeholder:text-gray-400',
              'transition-all duration-150',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {props.placeholder && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-[#1e7ae8] font-medium text-sm">
              {/* Watermark effect */}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

PrimitiveInput.displayName = 'PrimitiveInput';
