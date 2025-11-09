import React from "react";
import { cn } from "@/lib/utils";

interface PrimitiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const PrimitiveButton = React.forwardRef<
  HTMLButtonElement,
  PrimitiveButtonProps
>(
  (
    { children, variant = "primary", size = "md", className, ...props },
    ref
  ) => {
    const baseStyles =
      "relative font-medium  transition-all duration-150 ease-out focus:outline-none flex items-center gap-2 ";

    const variantStyles = {
      primary:
        "bg-[#1664d9] text-white shadow-[0_6px_0_0_#0d56b3] active:shadow-[0_2px_0_0_#0d56b3] active:translate-y-[4px] hover:bg-[#1a6dd4] focus:ring-[#1e7ae8]",
      secondary:
        "bg-[#f0f0f0] text-[#333] shadow-[0_6px_0_0_#d0d0d0] active:shadow-[0_2px_0_0_#d0d0d0] active:translate-y-[4px] hover:bg-[#e8e8e8] focus:ring-[#999]",
    };

    const sizeStyles = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PrimitiveButton.displayName = "PrimitiveButton";
