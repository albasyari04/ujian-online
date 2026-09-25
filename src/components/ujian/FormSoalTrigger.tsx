"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { FormSoal, type SoalAwal } from "@/components/ujian/FormSoal"
import { IconPlus, IconPencil } from "@/components/ui/Icons"

/**
 * Wrapper client-side untuk FormSoal.
 *
 * Karena FormSoal sekarang adalah controlled modal (butuh props `open` & `onClose`),
 * komponen ini yang mengelola state buka/tutup, dan menyediakan tombol pemicu.
 *
 * Dua mode pemakaian:
 * - Mode "create": tombol "+ Tambah Soal" (default, dengan styling primary).
 * - Mode "edit": tombol ikon pensil kecil (dengan initialData).
 */
export function FormSoalTrigger({
  ujianId,
  initialData,
  trigger = "create",
  label,
}: {
  ujianId: string
  initialData?: SoalAwal
  /** "create" menampilkan tombol Tambah, "edit" menampilkan ikon pensil. */
  trigger?: "create" | "edit"
  /** Override label tombol create (opsional). */
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      {trigger === "create" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(67,56,202,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(67,56,202,0.5)]"
        >
          <IconPlus className="h-4 w-4" />
          {label ?? "Tambah Soal"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-[#5b657d] shadow-sm backdrop-blur-sm transition-all hover:bg-[#eef2ff] hover:text-[#4338ca] dark:bg-white/5 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-[#818cf8]"
          aria-label="Edit soal"
        >
          <IconPencil className="h-3.5 w-3.5" />
        </button>
      )}

      <FormSoal
        ujianId={ujianId}
        initialData={initialData}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}