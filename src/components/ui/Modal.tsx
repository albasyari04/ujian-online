"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"

import { Button } from "./Button"
import { IconX } from "./Icons"

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "480px",
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-[#e7e4dc] bg-white p-6 shadow-[0_24px_60px_rgba(6,78,59,0.22)]"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-[17px] font-semibold text-[#16233f]">
              {title}
            </h2>
            {description && <p className="mt-1 text-[12.5px] text-[#8b93a6]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8b93a6] hover:bg-[#f0f2f1]"
            aria-label="Tutup"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  isLoading = false,
  errorMessage,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  errorMessage?: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} maxWidth="400px">
      <div className="flex flex-col gap-4">
        {errorMessage && (
          <p className="rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b]">
            {errorMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}