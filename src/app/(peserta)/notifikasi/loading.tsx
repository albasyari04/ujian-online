export default function NotifikasiLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-28 animate-pulse rounded-full bg-[#efece4]" />
        <div className="h-7 w-40 animate-pulse rounded-full bg-[#efece4]" />
        <div className="h-3 w-64 animate-pulse rounded-full bg-[#efece4]" />
      </div>

      <div className="flex items-center justify-between">
        <div className="h-3 w-44 animate-pulse rounded-full bg-[#efece4]" />
        <div className="h-8 w-32 animate-pulse rounded-[10px] bg-[#efece4]" />
      </div>

      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-[14px] border border-[#efece4] bg-white px-4 py-3.5"
          >
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-[10px] bg-[#efece4]" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3.5 w-1/3 animate-pulse rounded-full bg-[#efece4]" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#efece4]" />
              <div className="h-2.5 w-16 animate-pulse rounded-full bg-[#efece4]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}