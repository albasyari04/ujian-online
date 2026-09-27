export type StatusNavigasiSoal = "belum" | "terjawab" | "aktif"

export function NavigasiSoal({
  totalSoal,
  indexAktif,
  soalTerjawab,
  onPindah,
}: {
  totalSoal: number
  indexAktif: number
  soalTerjawab: boolean[]
  onPindah: (index: number) => void
}) {
  const jumlahTerjawab = soalTerjawab.filter(Boolean).length

  return (
    <div className="rounded-[16px] border border-[#e7e4dc] bg-white p-4 shadow-[0_8px_30px_-12px_rgba(49,46,129,0.15)] dark:border-white/10 dark:bg-[#0d1526]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#16233f] dark:text-white">Navigasi Soal</p>
        <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#4338ca] dark:bg-[#818cf8]/10 dark:text-[#818cf8]">
          {jumlahTerjawab}/{totalSoal}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: totalSoal }).map((_, index) => {
          const status: StatusNavigasiSoal =
            index === indexAktif ? "aktif" : soalTerjawab[index] ? "terjawab" : "belum"

          return (
            <button
              key={index}
              type="button"
              onClick={() => onPindah(index)}
              aria-current={status === "aktif"}
              className={`flex h-9 w-full items-center justify-center rounded-[10px] text-[12.5px] font-semibold transition-all duration-150 ${
                status === "aktif"
                  ? "scale-110 bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_6px_14px_-4px_rgba(67,56,202,0.6)]"
                  : status === "terjawab"
                    ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 shadow-[0_2px_6px_-2px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_-4px_rgba(16,185,129,0.5)] dark:from-emerald-500/20 dark:to-emerald-500/30 dark:text-emerald-400"
                    : "bg-[#f1f0f8] text-[#5b5490] hover:-translate-y-0.5 hover:bg-[#e4e2f4] hover:shadow-[0_4px_10px_-4px_rgba(91,84,144,0.4)] dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
              }`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f1f0f8] pt-3 text-[11.5px] text-[#8b93a6] dark:border-white/5 dark:text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca]" /> Aktif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Terjawab
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#5b5490]" /> Belum
        </span>
      </div>
    </div>
  )
}