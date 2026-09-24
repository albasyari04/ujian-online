"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"

import { IconX } from "./Icons"

/* =========================================================
   MODAL DASAR
========================================================= */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean
  onClose: () => void
  title: string
  /** Teks penjelasan singkat di bawah judul (opsional). */
  description?: string
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

        {description && (
          <p className="mt-1.5 text-[12.5px] text-[#5b657d] dark:text-white/60">{description}</p>
        )}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

/* =========================================================
   CONFIRM MODAL
   Modal konfirmasi generik (mis. konfirmasi hapus data).
   Semua props di luar open/onClose/onConfirm/title bersifat
   opsional dengan nilai default yang wajar.
========================================================= */

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  tone = "default",
  loading = false,
  isLoading,
  errorMessage,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  /** Teks penjelasan singkat. Bisa juga diisi via children untuk konten custom. */
  description?: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** "danger" untuk aksi destruktif (mis. hapus data) — tombol konfirmasi jadi merah. */
  tone?: "default" | "danger"
  loading?: boolean
  /** Alias dari `loading`, dipakai di beberapa halaman. */
  isLoading?: boolean
  /** Pesan error yang tampil di dalam modal (mis. gagal hapus data). */
  errorMessage?: string
}) {
  const busy = isLoading ?? loading

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      {description && <p className="text-[13px] text-[#5b657d] dark:text-white/60">{description}</p>}
      {errorMessage && (
        <p className="mt-2 rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b]">
          {errorMessage}
        </p>
      )}
      {children}

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-xl border border-[#e7e4dc] px-4 py-2 text-[13px] font-medium text-[#5b657d] transition-colors hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`rounded-xl px-4 py-2 text-[13px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            tone === "danger"
              ? "bg-[#d23b3b] hover:bg-[#b52f2f]"
              : "bg-[#2a5cd6] hover:bg-[#1f47ad]"
          }`}
        >
          {busy ? "Memproses..." : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}