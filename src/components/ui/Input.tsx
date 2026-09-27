import { forwardRef } from "react"
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-10 w-full rounded-[10px] border bg-white px-3.5 text-[13px] text-[#16233f] placeholder:text-[#94a3b8] transition-colors focus:outline-none focus:ring-2 dark:bg-[#141c30] dark:text-white dark:placeholder:text-white/30 ${
            error
              ? "border-[#d23b3b] focus:border-[#d23b3b] focus:ring-[#f8d7d7] dark:border-red-400/40 dark:focus:ring-red-400/20"
              : "border-[#e7e4dc] focus:border-[#6ee7b7] focus:ring-[#d1fae5] dark:border-white/10 dark:focus:border-emerald-400/60 dark:focus:ring-emerald-400/10"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11.5px] text-[#d23b3b] dark:text-red-300">{error}</p>
        ) : hint ? (
          <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">{hint}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = "Input"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, className = "", children, ...props }, ref) => {
    const selectId = id ?? props.name

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`h-10 w-full rounded-[10px] border bg-white px-3.5 text-[13px] text-[#16233f] transition-colors focus:outline-none focus:ring-2 dark:bg-[#141c30] dark:text-white ${
            error
              ? "border-[#d23b3b] focus:border-[#d23b3b] focus:ring-[#f8d7d7] dark:border-red-400/40 dark:focus:ring-red-400/20"
              : "border-[#e7e4dc] focus:border-[#6ee7b7] focus:ring-[#d1fae5] dark:border-white/10 dark:focus:border-emerald-400/60 dark:focus:ring-emerald-400/10"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="text-[11.5px] text-[#d23b3b] dark:text-red-300">{error}</p>
        ) : hint ? (
          <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">{hint}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = "Select"