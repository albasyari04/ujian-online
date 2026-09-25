import Link from "next/link"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { FormSoalTrigger } from "@/components/ujian/FormSoalTrigger"
import { ImportSoal } from "@/components/admin/ImportSoal"
import { HapusButton } from "@/components/admin/HapusButton"
import { LABEL_TIPE_SOAL } from "@/lib/ujian-utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SoalUjianPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ujian = await prisma.ujian.findUnique({
    where: { id },
    include: {
      soal: {
        orderBy: { urutan: "asc" },
        include: { opsi: { orderBy: { urutan: "asc" } } },
      },
    },
  })

  if (!ujian) {
    notFound()
  }

  const totalPoin = ujian.soal.reduce((total, soal) => total + soal.poin, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/ujian" className="text-[12.5px] font-medium text-[#8b87a8] hover:text-[#4338ca]">
            ← Kembali ke daftar ujian
          </Link>
          <h1 className="mt-1 text-[20px] font-semibold text-[#241f4d]">Soal — {ujian.judul}</h1>
          <p className="text-[13px] text-[#8b87a8]">
            {ujian.soal.length} soal · total {totalPoin} poin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportSoal ujianId={ujian.id} />
          {/* Tombol "Tambah Soal" — wrapper mengelola state open */}
          <FormSoalTrigger ujianId={ujian.id} trigger="create" />
        </div>
      </div>

      {ujian.soal.length === 0 ? (
        <div className="rounded-2xl border border-[#ecebf7] bg-white p-10 text-center">
          <p className="text-[14px] font-medium text-[#241f4d]">Belum ada soal</p>
          <p className="mt-1 text-[13px] text-[#8b87a8]">Tambahkan soal pertama untuk ujian ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ujian.soal.map((soal, index) => (
            <div key={soal.id} className="rounded-2xl border border-[#ecebf7] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11.5px] font-medium uppercase tracking-wide text-[#8b87a8]">
                    Soal {index + 1} · {LABEL_TIPE_SOAL[soal.tipe]} · {soal.poin} poin
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[14px] text-[#241f4d]">{soal.pertanyaan}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {/* Tombol Edit — wrapper mengelola state open dengan initialData */}
                  <FormSoalTrigger
                    ujianId={ujian.id}
                    trigger="edit"
                    initialData={{
                      id: soal.id,
                      pertanyaan: soal.pertanyaan,
                      tipe: soal.tipe,
                      poin: soal.poin,
                      opsi: soal.opsi,
                    }}
                  />
                  <HapusButton
                    url={`/api/ujian/${ujian.id}/soal/${soal.id}`}
                    konfirmasi="Hapus soal ini beserta seluruh opsinya?"
                  />
                </div>
              </div>

              {soal.tipe === "PILIHAN_GANDA" && soal.opsi.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-[#f1f0f8] pt-3">
                  {soal.opsi.map((opsi, opsiIndex) => (
                    <li
                      key={opsi.id}
                      className={`flex items-center gap-2 text-[13px] ${
                        opsi.benar ? "font-medium text-[#1f9254]" : "text-[#5b5490]"
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10.5px]">
                        {String.fromCharCode(65 + opsiIndex)}
                      </span>
                      {opsi.teks}
                      {opsi.benar && <span className="text-[11px]">(benar)</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}