import Link from "next/link"

export function EmptyPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center bg-[#f6f5f1] px-6 py-12 dark:bg-[#0b1120]">
      <section className="w-full max-w-xl rounded-[20px] border border-[#e7e4dc] bg-white p-8 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_20px_40px_-16px_rgba(49,46,129,0.22)] dark:border-white/10 dark:bg-[#101a30] dark:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b8863b] dark:text-amber-300">
          Ujian Online
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#16233f] dark:text-white">{title}</h1>
        <p className="mt-3 leading-7 text-[#5b657d] dark:text-white/60">{description}</p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-[10px] bg-gradient-to-br from-[#233052] to-[#16233f] px-5 py-3 font-medium text-white shadow-[0_10px_20px_-8px_rgba(22,35,63,0.5)] transition-colors hover:brightness-110"
        >
          Kembali ke beranda
        </Link>
      </section>
    </main>
  )
}