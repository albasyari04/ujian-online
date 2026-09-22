export default function RiwayatUjianLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat riwayat ujian">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-36 animate-pulse rounded bg-[#e7e4dc]" />
        <div className="h-8 w-56 animate-pulse rounded bg-[#e7e4dc]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[#efece4]" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-[14px] border border-[#e7e4dc] bg-white" />
        ))}
      </div>

      <div className="h-10 w-full max-w-sm animate-pulse rounded-[10px] border border-[#e7e4dc] bg-white" />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-[16px] border border-[#e7e4dc] bg-white" />
        ))}
      </div>
    </div>
  )
}