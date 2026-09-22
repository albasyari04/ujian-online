"use client"

import type { TipePelanggaran } from "@prisma/client"

const LABEL_TIPE_PELANGGARAN: Record<TipePelanggaran, string> = {
  PINDAH_TAB: "berpindah tab atau jendela",
  KELUAR_FULLSCREEN: "keluar dari mode layar penuh",
  KEHILANGAN_FOKUS: "kehilangan fokus jendela ujian",
  COPY_PASTE: "melakukan copy/paste",
  KLIK_KANAN: "melakukan klik kanan",
  DEVTOOLS: "membuka developer tools",
}

export function PeringatanModal({
  open,
  tipe,
  jumlahPelanggaran,
  batasPelanggaran,
  onTutup,
}: {
  open: boolean
  tipe: TipePelanggaran | null
  jumlahPelanggaran: number
  batasPelanggaran: number
  onTutup: () => void
}) {
  if (!open || !tipe) return null

  const didiskualifikasi = jumlahPelanggaran >= batasPelanggaran
  const sisaKesempatan = Math.max(0, batasPelanggaran - jumlahPelanggaran)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            didiskualifikasi ? "bg-[#fdeaea]" : "bg-[#fdf3e2]"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
            <path
              d="M12 3L21.5 20H2.5L12 3Z"
              stroke={didiskualifikasi ? "#d23b3b" : "#b8863b"}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M12 9.5V14" stroke={didiskualifikasi ? "#d23b3b" : "#b8863b"} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16.8" r="0.9" fill={didiskualifikasi ? "#d23b3b" : "#b8863b"} />
          </svg>
        </div>

        <h2 className="mt-4 text-[17px] font-semibold text-[#241f4d]">
          {didiskualifikasi ? "Ujian dihentikan" : "Pelanggaran terdeteksi"}
        </h2>

        <p className="mt-2 text-[13.5px] leading-6 text-[#5b5490]">
          Sistem mendeteksi Anda <span className="font-medium text-[#241f4d]">{LABEL_TIPE_PELANGGARAN[tipe]}</span>.
          {didiskualifikasi
            ? " Anda telah melewati batas maksimal pelanggaran yang diizinkan, sehingga ujian ini otomatis diakhiri."
            : ` Pelanggaran ini tercatat pada sistem (${jumlahPelanggaran}/${batasPelanggaran}).`}
        </p>

        {!didiskualifikasi && (
          <p className="mt-1 text-[12.5px] text-[#8b87a8]">
            Sisa kesempatan sebelum ujian otomatis dihentikan: <span className="font-medium">{sisaKesempatan}</span>
          </p>
        )}

        <button
          type="button"
          onClick={onTutup}
          className={`mt-5 w-full rounded-[10px] px-5 py-2.5 text-[13.5px] font-semibold text-white ${
            didiskualifikasi ? "bg-[#d23b3b] hover:bg-[#b93131]" : "bg-[#4338ca] hover:bg-[#3730a3]"
          }`}
        >
          {didiskualifikasi ? "Kembali ke beranda" : "Saya mengerti, lanjutkan ujian"}
        </button>
      </div>
    </div>
  )
}