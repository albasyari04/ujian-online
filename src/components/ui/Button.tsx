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
    "bg-gradient-to-br from-[#007fc4] to-[#00a7ff] text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_4px_0_#0064a0,0_10px_18px_-8px_rgba(0,126,196,0.55)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_5px_0_#0064a0,0_14px_22px_-8px_rgba(0,126,196,0.6)] active:translate-y-0 active:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_2px_0_#0064a0,0_6px_12px_-8px_rgba(0,126,196,0.5)]",
  secondary:
    "bg-gradient-to-br from-[#233052] to-[#16233f] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_4px_0_#0c1526,0_10px_18px_-8px_rgba(22,35,63,0.55)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_5px_0_#0c1526,0_14px_22px_-8px_rgba(22,35,63,0.6)] active:translate-y-0 active:shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_2px_0_#0c1526,0_6px_12px_-8px_rgba(22,35,63,0.5)]",
  outline:
    "border border-[#e7e4dc] bg-white text-[#34435f] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_2px_0_#eef0f4,0_6px_14px_-8px_rgba(22,35,63,0.22)] hover:-translate-y-0.5 hover:border-[#d8d4c8] hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_3px_0_#eef0f4,0_10px_18px_-8px_rgba(22,35,63,0.26)] active:translate-y-0 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_2px_0_rgba(0,0,0,0.35),0_6px_14px_-8px_rgba(0,0,0,0.5)] dark:hover:border-white/20 dark:hover:bg-white/[0.07]",
  danger:
    "bg-gradient-to-br from-[#e15252] to-[#c02f2f] text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_0_#8f2323,0_10px_18px_-8px_rgba(210,59,59,0.5)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_5px_0_#8f2323,0_14px_22px_-8px_rgba(210,59,59,0.55)] active:translate-y-0 active:shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_2px_0_#8f2323,0_6px_12px_-8px_rgba(210,59,59,0.45)]",
  ghost: "text-[#34435f] hover:bg-[#f0f2f1] dark:text-white/70 dark:hover:bg-white/10",
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
        className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && <IconSpinner className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"