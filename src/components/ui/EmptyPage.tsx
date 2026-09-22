import Link from "next/link"

export function EmptyPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-[#e4dfd2] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#16233f]">{title}</h1>
        <p className="mt-3 leading-7 text-[#5b657d]">{description}</p>
        <Link href="/" className="mt-7 inline-flex rounded-lg bg-[#16233f] px-5 py-3 font-medium text-white hover:bg-[#233052]">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  )
}