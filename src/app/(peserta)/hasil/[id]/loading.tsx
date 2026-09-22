export default function HasilDetailLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat detail hasil ujian">
      <div className="h-4 w-32 animate-pulse rounded bg-[#e7e4dc]" />

      <div className="h-32 animate-pulse rounded-2xl border border-[#e7e4dc] bg-white" />

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-[14px] border border-[#e7e4dc] bg-white" />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-5 w-40 animate-pulse rounded bg-[#e7e4dc]" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[16px] border border-[#e7e4dc] bg-white" />
        ))}
      </div>
    </div>
  )
}