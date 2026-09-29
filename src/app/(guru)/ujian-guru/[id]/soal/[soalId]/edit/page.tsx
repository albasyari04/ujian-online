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

  const ujian = await prisma.ujian.findFirst({
    where: { id, pembuatId: guru.user.id },
    select: { id: true, judul: true },
  })

  if (!ujian) notFound()

  const soal = await prisma.soal.findFirst({
    where: { id: soalId, ujianId: ujian.id },
    include: { opsi: { orderBy: { urutan: "asc" } } },
  })

  if (!soal) notFound()

  // Hitung total soal di ujian ini (untuk auto-bobot)
  const totalSoalUjian = await prisma.soal.count({
    where: { ujianId: ujian.id },
  })

  return (
    <div className="w-full space-y-5">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4">
        <Link
          href={`/ujian-guru/${ujian.id}`}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#e7e4dc] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#5b657d] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f7f9f8] hover:text-[#4338ca] dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-[#818cf8]"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Detail Ujian
        </Link>

        <div className="relative overflow-hidden rounded-[24px] border border-[#e7e4dc] bg-gradient-to-br from-[#eef4ff] via-white to-[#f5f3ff] p-5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_20px_40px_-20px_rgba(49,46,129,0.25)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30] sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.22),transparent_65%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(129,199,253,0.18),transparent_65%)]"
          />
          <div className="relative">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6d78a6] dark:text-white/50">
              {ujian.judul}
            </p>
            <h1 className="mt-1 text-[24px] font-bold leading-tight text-[#16233f] dark:text-white sm:text-[26px]">
              Edit Soal
            </h1>
            <p className="mt-1.5 text-[13px] text-[#5b657d] dark:text-white/50">
              Ubah pertanyaan, tipe soal, kunci jawaban, poin, atau opsi jawaban di bawah ini.
            </p>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#e7e4dc] bg-white p-5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_18px_36px_-20px_rgba(49,46,129,0.35)] dark:border-white/10 dark:bg-[#101a30] sm:p-7">
        <FormSoalPage
          ujianId={ujian.id}
          redirectTo={`/ujian-guru/${ujian.id}`}
          totalSoalUjian={totalSoalUjian}
          initialData={{
            id: soal.id,
            pertanyaan: soal.pertanyaan,
            tipe: soal.tipe,
            kunciJawaban: soal.kunciJawaban ?? "",
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