"use client"

import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"

import { IconSpinner } from "./Icons"

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost"
type Size = "sm" | "md"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-[#007fc4] to-[#00a7ff] text-white shadow-[0_3px_8px_rgba(0,126,196,0.35)] hover:brightness-105",
  secondary: "bg-[#16233f] text-white hover:bg-[#233052]",
  outline: "border border-[#e7e4dc] bg-white text-[#34435f] hover:bg-[#f7f9f8]",
  danger: "bg-[#d23b3b] text-white shadow-[0_3px_8px_rgba(210,59,59,0.3)] hover:bg-[#b52f2f]",
  ghost: "text-[#34435f] hover:bg-[#f0f2f1]",
}

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-10 px-4 text-[13.5px]",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && <IconSpinner className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"