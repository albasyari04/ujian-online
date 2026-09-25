"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import type { Soal, Opsi } from "@prisma/client"
import { FormSoal, type SoalAwal } from "@/components/ujian/FormSoal"
import { ImportSoal } from "@/components/admin/ImportSoal"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { IconDocument, IconPencil, IconPlus, IconTrash } from "@/components/ui/Icons"

export function SoalManagerClient({ ujianId, soalAwal }: { ujianId: string; soalAwal: (Soal & { opsi: Opsi[] })[] }) {
  const router = useRouter()
  const [daftarSoal, setDaftarSoal] = useState(soalAwal)
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null)
  const [editingSoal, setEditingSoal] = useState<SoalAwal | undefined>(undefined)

  function openFormBuat() {
    setEditingSoal(undefined)
    setFormMode("create")
  }

  function openFormEdit(s: SoalAwal) {
    setEditingSoal(s)
    setFormMode("edit")
  }

  function closeForm() {
    setFormMode(null)
    setEditingSoal(undefined)
  }

  function handleSuccess() {
    // Refresh data di server & client
    router.refresh()
    fetch(`/api/ujian/${ujianId}/soal`)
      .then((res) => res.json())
      .then((data) => setDaftarSoal(data))
      .catch(() => router.refresh())
    closeForm()
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
          <Button
            onClick={openFormBuat}
            className="flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(67,56,202,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(67,56,202,0.5)]"
          >
            <IconPlus className="h-4 w-4" />
            Tambah Soal
          </Button>
        </div>
      </div>

      {/* Daftar Soal */}
      {daftarSoal.length === 0 ? (
        <Card variant="glass" className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f5f9] dark:bg-white/5">
            <IconDocument className="h-7 w-7 text-[#94a3b8]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">Belum ada soal</p>
            <p className="mt-1 text-[12.5px] text-[#5b657d] dark:text-white/50">
              Tambahkan soal pertama untuk ujian ini.
            </p>
          </div>
          <Button
            onClick={openFormBuat}
            variant="outline"
            className="mt-2 rounded-[10px] border-[#e7e4dc] px-4 py-2 text-[12.5px] font-medium text-[#4338ca] hover:bg-[#eef2ff] dark:border-white/10 dark:text-[#818cf8] dark:hover:bg-white/5"
          >
            <IconPlus className="mr-1.5 h-3.5 w-3.5" />
            Tambah Soal Pertama
          </Button>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {daftarSoal.map((soal, i) => (
            <Card
              key={soal.id}
              variant="glass"
              className="group relative flex flex-col gap-3 p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_10px_24px_-10px_rgba(22,35,63,0.1),0_32px_52px_-18px_rgba(49,46,129,0.25)] dark:hover:bg-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge
                    tone="indigo"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold"
                  >
                    {i + 1}
                  </Badge>
                  <span className="text-[12px] font-medium text-[#5b657d] dark:text-white/50">
                    {soal.poin} Poin
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openFormEdit(soal)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-[#5b657d] shadow-sm backdrop-blur-sm transition-all hover:bg-[#eef2ff] hover:text-[#4338ca] dark:bg-white/5 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-[#818cf8]"
                    aria-label="Edit soal"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDelete(soal.id)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-[#d23b3b] shadow-sm backdrop-blur-sm transition-all hover:bg-[#fdf1f1] dark:bg-white/5 dark:hover:bg-red-500/10"
                    aria-label="Hapus soal"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[14.5px] leading-relaxed text-[#16233f] dark:text-white/90">
                {soal.pertanyaan}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form Soal — controlled dari sini */}
      <FormSoal
        ujianId={ujianId}
        initialData={editingSoal}
        open={formMode !== null}
        onClose={closeForm}
        onSuccess={handleSuccess}
      />
    </>
  )
}