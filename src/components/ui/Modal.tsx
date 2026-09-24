"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"

import { IconX } from "./Icons"

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-[#0b1120]/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 max-h-[88vh] w-full ${maxWidth} overflow-y-auto rounded-[20px] border border-[#e7e4dc] bg-white p-5 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#101a30] sm:p-6`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold text-[#16233f] dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8b93a6] hover:bg-[#f4f5f7] dark:text-white/50 dark:hover:bg-white/10"
            aria-label="Tutup"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
