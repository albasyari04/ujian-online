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

  function handleSuccess() {
    router.refresh()
    setFormMode(null)
    // Update daftarSoal setelah perubahan
    fetch(`/api/ujian/${ujianId}/soal`)
      .then(res => res.json())
      .then(data => setDaftarSoal(data))
      .catch(() => router.refresh())
  }

  async function handleDelete(soalId: string) {
    const res = await fetch(`/api/ujian/${ujianId}/soal/${soalId}`, { method: 'DELETE' });
    if (res.ok) {
      handleSuccess();
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-[#16233f] dark:text-white">Bank Soal Ujian Ini</h2>
        <div className="flex items-center gap-2">
          <ImportSoal ujianId={ujianId} onSuccess={handleSuccess} />
          <Button onClick={openFormBuat}>
            <IconPlus className="h-4 w-4" />
            Tambah Soal
          </Button>
        </div>
      </div>

      {daftarSoal.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
          <IconDocument className="h-9 w-9 text-[#c7cdd8]" />
          <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">
            Belum ada soal. Tambahkan soal pertama untuk ujian ini.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {daftarSoal.map((soal, i) => (
            <Card key={soal.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] text-[#5b657d] dark:text-white/50">
                  <Badge tone="blue" className="mr-2">
                    #{i + 1}
                  </Badge>
                  {soal.poin} poin
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openFormEdit(soal)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b93a6] hover:bg-[#f4f5f7] dark:text-white/40 dark:hover:bg-white/10"
                    aria-label="Edit soal"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(soal.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#d23b3b] hover:bg-[#fdf1f1] dark:hover:bg-red-500/10"
                    aria-label="Hapus soal"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[14px] text-[#16233f] dark:text-white">{soal.pertanyaan}</p>
            </Card>
          ))}
        </div>
      )}

      {formMode && <FormSoal ujianId={ujianId} initialData={editingSoal} />}
    </>
  )
}