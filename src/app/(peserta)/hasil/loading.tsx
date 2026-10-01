export default function HasilNilaiLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat hasil dan nilai">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 animate-pulse rounded bg-[#e7e4dc] dark:bg-white/10" />
        <div className="h-8 w-56 animate-pulse rounded bg-[#e7e4dc] dark:bg-white/10" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#efece4] dark:bg-white/5" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-[92px] animate-pulse rounded-[18px] border border-[#e7e4dc] bg-white shadow-[0_5px_0_#eef0f4] dark:border-white/10 dark:bg-[#101a30] dark:shadow-[0_5px_0_#0d1424] sm:h-[112px]"
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-[84px] animate-pulse rounded-[18px] border border-[#e7e4dc] bg-white shadow-[0_5px_0_#eef0f4] dark:border-white/10 dark:bg-[#101a30] dark:shadow-[0_5px_0_#0d1424]"
          />
        ))}
      </div>
    </div>
  )
}