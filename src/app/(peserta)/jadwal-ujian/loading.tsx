export default function JadwalUjianLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat jadwal ujian">
      <div className="aspect-[2146/732] w-full animate-pulse rounded-2xl bg-[#e7e4dc]" />

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-[#e7e4dc] bg-white" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="h-8 w-52 animate-pulse rounded bg-[#e7e4dc]" />
            <div className="h-8 w-32 animate-pulse rounded-xl bg-[#e7e4dc]" />
          </div>

          {Array.from({ length: 2 }, (_, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-3">
              <div className="h-5 w-32 animate-pulse rounded bg-[#e7e4dc]" />
              <div className="h-24 animate-pulse rounded-[16px] border border-[#e7e4dc] bg-white" />
              <div className="h-24 animate-pulse rounded-[16px] border border-[#e7e4dc] bg-white" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="h-80 animate-pulse rounded-2xl border border-[#e7e4dc] bg-white" />
          <div className="h-32 animate-pulse rounded-2xl bg-[#e7e4dc]" />
        </div>
      </div>
    </div>
  )
}