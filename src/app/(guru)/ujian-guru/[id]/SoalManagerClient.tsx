"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { Soal, Opsi } from "@prisma/client"
import { ImportSoal } from "@/components/admin/ImportSoal"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { IconDocument, IconPencil, IconPlus, IconTrash } from "@/components/ui/Icons"

export function SoalManagerClient({
  ujianId,
  soalAwal,
}: {
  ujianId: string
  soalAwal: (Soal & { opsi: Opsi[] })[]
}) {
  const router = useRouter()
  const [daftarSoal, setDaftarSoal] = useState(soalAwal)

  function handleSuccess() {
    router.refresh()
    fetch(`/api/ujian/${ujianId}/soal`)
      .then((res) => res.json())
      .then((data) => setDaftarSoal(data))
      .catch(() => router.refresh())
  }

  async function handleDelete(soalId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return

    const res = await fetch(`/api/ujian/${ujianId}/soal/${soalId}`, { method: "DELETE" })
    if (res.ok) {
      handleSuccess()
    }
  }

  return (
    <>
      {/* Header Bagian Bank Soal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#16233f] dark:text-white">Bank Soal Ujian Ini</h2>
          <p className="mt-0.5 text-[12.5px] text-[#5b657d] dark:text-white/50">
            Kelola daftar pertanyaan untuk ujian ini.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <ImportSoal ujianId={ujianId} onSuccess={handleSuccess} />
          <Link
            href={`/ujian-guru/${ujianId}/soal/baru`}
            className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(67,56,202,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(67,56,202,0.5)]"
          >
            <IconPlus className="h-4 w-4" />
            Tambah Soal
          </Link>
        </div>
      </div>

      {/* Daftar Soal */}
      {daftarSoal.length === 0 ? (
        <Card
          variant="glass"
          className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f5f9] dark:bg-white/5">
            <IconDocument className="h-7 w-7 text-[#94a3b8]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">Belum ada soal</p>
            <p className="mt-1 text-[12.5px] text-[#5b657d] dark:text-white/50">
              Tambahkan soal pertama untuk ujian ini.
            </p>
          </div>
          <Link
            href={`/ujian-guru/${ujianId}/soal/baru`}
            className="mt-2 inline-flex items-center gap-1.5 rounded-[10px] border border-[#e7e4dc] bg-white px-4 py-2 text-[12.5px] font-medium text-[#4338ca] hover:bg-[#eef2ff] dark:border-white/10 dark:bg-white/5 dark:text-[#818cf8] dark:hover:bg-white/10"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Tambah Soal Pertama
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {daftarSoal.map((soal, i) => (
            <Card
              key={soal.id}
              variant="glass"
              className="group relative flex flex-col gap-3 overflow-hidden rounded-[16px] border border-[#e7e4dc]/60 bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9] p-5 shadow-[0_4px_16px_-8px_rgba(22,35,63,0.1)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(49,46,129,0.3)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30]"
            >
              {/* Dekorasi background card */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.12),transparent_65%)]" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge
                    tone="indigo"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-[12px] font-bold text-white shadow-[0_4px_12px_-4px_rgba(67,56,202,0.5)]"
                  >
                    {i + 1}
                  </Badge>
                  <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11.5px] font-medium text-[#4338ca] dark:bg-[#818cf8]/10 dark:text-[#818cf8]">
                    {soal.poin} Poin
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                  <Link
                    href={`/ujian-guru/${ujianId}/soal/${soal.id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#5b657d] shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#eef2ff] hover:text-[#4338ca] dark:bg-white/5 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-[#818cf8]"
                    aria-label="Edit soal"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(soal.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#d23b3b] shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#fdf1f1] dark:bg-white/5 dark:hover:bg-red-500/10"
                    aria-label="Hapus soal"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="relative text-[14.5px] leading-relaxed text-[#16233f] dark:text-white/90">
                {soal.pertanyaan}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}