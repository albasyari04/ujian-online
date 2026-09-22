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
  /** opsiId terpilih (untuk pilihan ganda) atau teks jawaban (untuk essay) */
  jawaban: string
  onJawabChange: (jawaban: string) => void
}) {
  return (
    <div className="rounded-2xl border border-[#ecebf7] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11.5px] font-medium uppercase tracking-wide text-[#8b87a8]">
          Soal {nomor} dari {totalSoal}
        </p>
        <span className="rounded-full bg-[#f1f0f8] px-2.5 py-1 text-[11.5px] font-medium text-[#5b5490]">
          {soal.poin} poin
        </span>
      </div>

      <p className="whitespace-pre-line text-[15px] leading-7 text-[#241f4d]">{soal.pertanyaan}</p>

      <div className="mt-5">
        {soal.tipe === "PILIHAN_GANDA" ? (
          <div className="space-y-2.5">
            {soal.opsi.map((opsi, index) => {
              const terpilih = jawaban === opsi.id

              return (
                <label
                  key={opsi.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[12px] border px-4 py-3 transition-colors ${
                    terpilih
                      ? "border-[#4338ca] bg-[#f5f4fd]"
                      : "border-[#ecebf7] hover:border-[#c9c5ea] hover:bg-[#faf9fd]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`soal-${soal.id}`}
                    checked={terpilih}
                    onChange={() => onJawabChange(opsi.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#4338ca] focus:ring-[#4338ca]"
                  />
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10.5px] text-[#5b5490]">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-[13.5px] leading-6 text-[#241f4d]">{opsi.teks}</span>
                </label>
              )
            })}
          </div>
        ) : (
          <textarea
            value={jawaban}
            onChange={(e) => onJawabChange(e.target.value)}
            rows={6}
            placeholder="Tulis jawaban Anda di sini..."
            className="w-full resize-none rounded-[12px] border border-[#dcd9ee] px-4 py-3 text-[14px] leading-6 text-[#241f4d] outline-none focus:border-[#4338ca]"
          />
        )}
      </div>
    </div>
  )
}