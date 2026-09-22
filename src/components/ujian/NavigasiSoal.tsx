export type StatusNavigasiSoal = "belum" | "terjawab" | "aktif"

export function NavigasiSoal({
  totalSoal,
  indexAktif,
  soalTerjawab,
  onPindah,
}: {
  totalSoal: number
  indexAktif: number
  /** array boolean sepanjang totalSoal, true = soal sudah dijawab */
  soalTerjawab: boolean[]
  onPindah: (index: number) => void
}) {
  const jumlahTerjawab = soalTerjawab.filter(Boolean).length

  return (
    <div className="rounded-2xl border border-[#ecebf7] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#241f4d]">Navigasi Soal</p>
        <p className="text-[11.5px] text-[#8b87a8]">
          {jumlahTerjawab}/{totalSoal} terjawab
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalSoal }).map((_, index) => {
          const status: StatusNavigasiSoal =
            index === indexAktif ? "aktif" : soalTerjawab[index] ? "terjawab" : "belum"

          return (
            <button
              key={index}
              type="button"
              onClick={() => onPindah(index)}
              aria-current={status === "aktif"}
              className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-[12.5px] font-semibold transition-colors ${
                status === "aktif"
                  ? "bg-[#4338ca] text-white"
                  : status === "terjawab"
                    ? "bg-[#e7f5ec] text-[#1f9254] hover:bg-[#d7ede0]"
                    : "bg-[#f1f0f8] text-[#5b5490] hover:bg-[#e4e2f4]"
              }`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-[#f1f0f8] pt-3 text-[11.5px] text-[#8b87a8]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4338ca]" /> Aktif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1f9254]" /> Terjawab
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#5b5490]" /> Belum
        </span>
      </div>
    </div>
  )
}