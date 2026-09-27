"use client"

import type { TipeSoal } from "@prisma/client"

type OpsiSoal = { id: string; teks: string }

export type SoalPeserta = {
  id: string
  pertanyaan: string
  tipe: TipeSoal
  poin: number
  opsi: OpsiSoal[]
}

export function SoalCard({
  soal,
  nomor,
  totalSoal,
  jawaban,
  onJawabChange,
}: {
  soal: SoalPeserta
  nomor: number
  totalSoal: number
  jawaban: string
  onJawabChange: (jawaban: string) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#e7e4dc] bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9] p-5 shadow-[0_8px_30px_-12px_rgba(49,46,129,0.2)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30] sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.15),transparent_65%)]"
      />

      <div className="relative mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-[15px] font-bold text-white shadow-[0_8px_16px_-4px_rgba(67,56,202,0.5)]">
            {nomor}
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
              Soal {nomor} dari {totalSoal}
            </p>
            <p className="text-[12.5px] font-semibold text-[#16233f] dark:text-white">
              {soal.tipe === "PILIHAN_GANDA" ? "Pilihan Ganda" : "Essay"}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[11.5px] font-semibold text-[#4338ca] shadow-sm dark:bg-[#818cf8]/10 dark:text-[#818cf8]">
          {soal.poin} poin
        </span>
      </div>

      <p className="relative whitespace-pre-line text-[15px] leading-7 text-[#241f4d] dark:text-white/90">
        {soal.pertanyaan}
      </p>

      <div className="relative mt-6">
        {soal.tipe === "PILIHAN_GANDA" ? (
          <div className="space-y-2.5">
            {soal.opsi.map((opsi, index) => {
              const terpilih = jawaban === opsi.id
              const huruf = String.fromCharCode(65 + index)

              return (
                <label
                  key={opsi.id}
                  className={`group/opsi flex cursor-pointer items-start gap-3 rounded-[14px] border-2 px-4 py-3.5 transition-all duration-200 ${
                    terpilih
                      ? "border-[#4338ca] bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] shadow-[0_6px_20px_-8px_rgba(67,56,202,0.5)]"
                      : "border-[#ecebf7] bg-white hover:-translate-y-0.5 hover:border-[#c9c5ea] hover:shadow-[0_8px_20px_-10px_rgba(67,56,202,0.25)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name={`soal-${soal.id}`}
                    checked={terpilih}
                    onChange={() => onJawabChange(opsi.id)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-all ${
                      terpilih
                        ? "bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_4px_10px_-2px_rgba(67,56,202,0.5)]"
                        : "border-2 border-[#d5d9e0] text-[#5b5490] group-hover/opsi:border-[#818cf8] group-hover/opsi:text-[#4338ca] dark:border-white/20 dark:text-white/50"
                    }`}
                  >
                    {terpilih ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      huruf
                    )}
                  </span>
                  <span
                    className={`flex-1 text-[14px] leading-6 ${
                      terpilih ? "font-medium text-[#241f4d] dark:text-white" : "text-[#34435f] dark:text-white/70"
                    }`}
                  >
                    {opsi.teks}
                  </span>
                </label>
              )
            })}
          </div>
        ) : (
          <textarea
            value={jawaban}
            onChange={(e) => onJawabChange(e.target.value)}
            rows={7}
            placeholder="Tulis jawaban Anda di sini..."
            className="w-full resize-none rounded-[14px] border-2 border-[#dcd9ee] bg-white px-4 py-3.5 text-[14px] leading-6 text-[#241f4d] outline-none transition-all focus:border-[#4338ca] focus:shadow-[0_0_0_4px_rgba(67,56,202,0.1)] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        )}
      </div>
    </div>
  )
}