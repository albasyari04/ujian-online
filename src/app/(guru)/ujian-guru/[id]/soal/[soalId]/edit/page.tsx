import Link from "next/link"
import { notFound } from "next/navigation"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { IconArrowLeft } from "@/components/ui/Icons"
import { FormSoalPage } from "@/components/ujian/FormSoalPage"

export default async function EditSoalPage({
  params,
}: {
  params: Promise<{ id: string; soalId: string }>
}) {
  const guru = await requireGuruSession()
  const { id, soalId } = await params

  // Pastikan ujian milik guru yang login
  const ujian = await prisma.ujian.findFirst({
    where: { id, pembuatId: guru.user.id },
    select: { id: true, judul: true },
  })

  if (!ujian) notFound()

  // Ambil soal + opsi
  const soal = await prisma.soal.findFirst({
    where: { id: soalId, ujianId: ujian.id },
    include: { opsi: { orderBy: { urutan: "asc" } } },
  })

  if (!soal) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/ujian-guru/${ujian.id}`}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] transition-colors hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#818cf8]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke Detail Ujian
      </Link>

      <div>
        <p className="text-[12px] font-medium uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
          {ujian.judul}
        </p>
        <h1 className="mt-1 text-[22px] font-bold text-[#16233f] dark:text-white">Edit Soal</h1>
        <p className="mt-1 text-[13px] text-[#5b657d] dark:text-white/50">
          Ubah pertanyaan, tipe soal, poin, atau opsi jawaban.
        </p>
      </div>

      <div className="rounded-[18px] border border-[#e7e4dc] bg-white p-5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_14px_28px_-14px_rgba(49,46,129,0.2)] dark:border-white/10 dark:bg-[#101a30] sm:p-6">
        <FormSoalPage
          ujianId={ujian.id}
          redirectTo={`/ujian-guru/${ujian.id}`}
          initialData={{
            id: soal.id,
            pertanyaan: soal.pertanyaan,
            tipe: soal.tipe,
            poin: soal.poin,
            opsi: soal.opsi.map((o) => ({
              id: o.id,
              teks: o.teks,
              benar: o.benar,
            })),
          }}
        />
      </div>
    </div>
  )
}