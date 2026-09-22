export function Footer({ label = "Panel Admin" }: { label?: string }) {
  return (
    <footer className="hidden h-[46px] shrink-0 items-center justify-center border-t border-[#e7e4dc] bg-white px-4 text-[11px] text-[#8b93a6] dark:border-white/10 dark:bg-[#0b1120] dark:text-white/40 lg:flex">
      © {new Date().getFullYear()} Ujian Online — {label}
    </footer>
  )
}