export default function StatistikLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat statistik belajar">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-36 animate-pulse rounded bg-[#e7e4dc]" />
        <div className="h-8 w-56 animate-pulse rounded bg-[#e7e4dc]" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#efece4]" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-[14px] border border-[#e7e4dc] bg-white" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl border border-[#e7e4dc] bg-white lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl border border-[#e7e4dc] bg-white" />
      </div>
    </div>
  )
}