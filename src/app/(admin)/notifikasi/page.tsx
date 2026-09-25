import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"

const formatterWaktu = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export const dynamic = "force-dynamic"

/* Ikon SVG inline lokal — tidak bergantung pada Icons.tsx supaya
   aman tanpa perlu memverifikasi nama export yang tersedia. */

function IconCalendar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v3.2M16 3v3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconAlertTriangle({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 4.2 3 19.5h18L12 4.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 10.2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
    </svg>
  )
}

function IconBell({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.6 1 5.2 1.8 6.2.3.4 0 1-.5 1H4.7c-.5 0-.8-.6-.5-1C5 14.2 6 12.6 6 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.5 18.5a2.6 2.6 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default async function NotifikasiPage() {
  const [ujianMendatang, pelanggaranTerbaru] = await Promise.all([
    prisma.ujian.findMany({
      where: { mulai: { gte: new Date() } },
      take: 8,
      orderBy: { mulai: "asc" },
      select: { id: true, judul: true, mulai: true },
    }),
    prisma.logPelanggaran.findMany({
      take: 8,
      orderBy: { waktu: "desc" },
      include: { hasilUjian: { include: { user: { select: { nama: true } }, ujian: { select: { judul: true } } } } },
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Header dengan icon bel bulat 3D */}
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_10px_20px_-8px_rgba(67,56,202,0.55)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <IconBell />
        </span>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p>
          <h1 className="mt-0.5 text-[22px] font-semibold text-[#16233f] dark:text-white sm:text-[26px]">
            Notifikasi
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[#5b657d] dark:text-white/50 sm:text-[13px]">
            Pembaruan penting dari aktivitas ujian dan pengawasan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Ujian akan datang — card 3D */}
        <Card className="overflow-hidden border-none bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_0_#e3e7ee,0_20px_32px_-16px_rgba(22,35,63,0.38)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_0_#0d1424,0_16px_28px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_0_#0d1424,0_22px_34px_-16px_rgba(0,0,0,0.68)]">
          <div className="flex items-center gap-3 border-b border-[#edf0ef] px-5 py-4 dark:border-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#93c5fd] to-[#2563eb] text-white shadow-[0_6px_14px_-6px_rgba(37,99,235,0.5)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <IconCalendar className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Ujian akan datang</h2>
              <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">
                Jadwal ujian yang segera dimulai.
              </p>
            </div>
          </div>

          {ujianMendatang.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6] dark:text-white/40">
              Tidak ada ujian terjadwal.
            </p>
          ) : (
            <div className="divide-y divide-[#f0f2f1] dark:divide-white/[0.06]">
              {ujianMendatang.map((ujian) => (
                <Link
                  key={ujian.id}
                  href={`/ujian/${ujian.id}/hasil`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#f7f9f8] dark:hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f0ff] text-[#2563eb] dark:bg-[#2563eb]/15 dark:text-[#8fb1ff]">
                      <IconCalendar className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#16233f] dark:text-white">
                        {ujian.judul}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                        Mulai {formatterWaktu.format(ujian.mulai)}
                      </p>
                    </div>
                  </div>
                  <Badge tone="blue">Terjadwal</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Pelanggaran terbaru — card 3D */}
        <Card className="overflow-hidden border-none bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_0_#e3e7ee,0_20px_32px_-16px_rgba(22,35,63,0.38)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_0_#0d1424,0_16px_28px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_0_#0d1424,0_22px_34px_-16px_rgba(0,0,0,0.68)]">
          <div className="flex items-center gap-3 border-b border-[#edf0ef] px-5 py-4 dark:border-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#fca5a5] to-[#b52f2f] text-white shadow-[0_6px_14px_-6px_rgba(181,47,47,0.5)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Pelanggaran terbaru</h2>
              <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">
                Aktivitas yang perlu ditinjau admin.
              </p>
            </div>
          </div>

          {pelanggaranTerbaru.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6] dark:text-white/40">
              Belum ada notifikasi.
            </p>
          ) : (
            <div className="divide-y divide-[#f0f2f1] dark:divide-white/[0.06]">
              {pelanggaranTerbaru.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#f7f9f8] dark:hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fdecec] text-[#d23b3b] dark:bg-[#d23b3b]/15 dark:text-[#f28b8b]">
                      <IconAlertTriangle className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#16233f] dark:text-white">
                        {item.hasilUjian.user.nama}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] text-[#8b93a6] dark:text-white/40">
                        {item.hasilUjian.ujian.judul} &middot; {formatterWaktu.format(item.waktu)}
                      </p>
                    </div>
                  </div>
                  <Badge tone="red">Perlu ditinjau</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}