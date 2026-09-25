import Link from "next/link"
import Image from "next/image"
import type { Prisma } from "@prisma/client"
import { StatusUjian } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ ujianId?: string; status?: string; q?: string }>

export default async function NilaiPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { ujianId, status, q } = await searchParams

  const statusFilter: StatusUjian | undefined =
    status === "SELESAI"
      ? StatusUjian.SELESAI
      : status === "SEDANG_DIKERJAKAN"
        ? StatusUjian.SEDANG_DIKERJAKAN
        : undefined

  const whereHasil: Prisma.HasilUjianWhereInput = {
    ...(ujianId ? { ujianId } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(q
      ? {
          user: {
            OR: [{ nama: { contains: q } }, { email: { contains: q } }],
          },
        }
      : {}),
  }

  const [daftarUjian, totalSelesai, totalDikerjakan, rataRata, daftarHasil] = await Promise.all([
    prisma.ujian.findMany({ select: { id: true, judul: true }, orderBy: { createdAt: "desc" } }),
    prisma.hasilUjian.count({ where: { status: StatusUjian.SELESAI } }),
    prisma.hasilUjian.count({ where: { status: StatusUjian.SEDANG_DIKERJAKAN } }),
    prisma.hasilUjian.aggregate({ where: { status: StatusUjian.SELESAI }, _avg: { skor: true } }),
    prisma.hasilUjian.findMany({
      where: whereHasil,
      include: {
        user: { select: { nama: true, email: true } },
        ujian: { select: { judul: true, soal: { select: { poin: true } } } },
      },
      orderBy: [{ waktuSelesai: "desc" }, { waktuMulai: "desc" }],
      take: 200,
    }),
  ])

  const queryEntries: [string, string][] = []
  if (ujianId) queryEntries.push(["ujianId", ujianId])
  if (statusFilter) queryEntries.push(["status", statusFilter])
  if (q) queryEntries.push(["q", q])
  const queryString = new URLSearchParams(queryEntries).toString()

  const exportHref = queryString ? "/api/nilai/export?" + queryString : "/api/nilai/export"

  const rataRataSkor = rataRata._avg.skor

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8863b] sm:text-[12px]">
            Ujian Online
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#16233f] dark:text-white sm:text-[26px]">
            Nilai
          </h1>
          <p className="mt-1 text-[12px] text-[#5b657d] dark:text-white/50 sm:text-[13px]">
            Nilai peserta otomatis muncul di sini begitu ujian mereka selesai dikerjakan.
          </p>
        </div>

        <Link
          href={exportHref}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#059669] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(5,150,105,0.25)] transition hover:bg-[#047857] hover:shadow-[0_8px_22px_rgba(5,150,105,0.35)] sm:px-4 sm:py-2.5 sm:text-[13px]"
        >
          <Image
            src="/image/icon/unduh-icon.png"
            alt="Unduh Excel"
            width={24}
            height={24}
            className="h-5 w-5 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] sm:h-6 sm:w-6"
          />
          Unduh Excel
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          label="Sudah Selesai"
          value={totalSelesai}
          iconImageSrc="/image/icon/selesai-icon.png"
          tone="emerald"
        />
        <StatCard
          label="Sedang Dikerjakan"
          value={totalDikerjakan}
          iconImageSrc="/image/icon/dikerjakan.png"
          tone="amber"
        />
        <StatCard
          label="Rata-rata Skor"
          value={rataRataSkor !== null ? rataRataSkor.toFixed(1) : "-"}
          iconImageSrc="/image/icon/rata-rata-score.png"
          tone="slate"
        />
      </div>

      <Card className="p-4 sm:p-5">
        <form method="GET" className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
          <select
            name="ujianId"
            defaultValue={ujianId ?? ""}
            className="col-span-1 h-11 rounded-[12px] border border-[#e2e6e4] bg-[#f7f9f8] px-3.5 text-[13px] font-medium text-[#16233f] shadow-[inset_0_1px_2px_rgba(22,35,63,0.04)] outline-none transition-all focus:border-[#059669] focus:bg-white focus:ring-2 focus:ring-[#059669]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:[color-scheme:dark] sm:w-52"
          >
            <option value="">Semua ujian</option>
            {daftarUjian.map((ujian) => (
              <option key={ujian.id} value={ujian.id}>
                {ujian.judul}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="col-span-1 h-11 rounded-[12px] border border-[#e2e6e4] bg-[#f7f9f8] px-3.5 text-[13px] font-medium text-[#16233f] shadow-[inset_0_1px_2px_rgba(22,35,63,0.04)] outline-none transition-all focus:border-[#059669] focus:bg-white focus:ring-2 focus:ring-[#059669]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:[color-scheme:dark] sm:w-44"
          >
            <option value="">Semua status</option>
            <option value="SELESAI">Selesai</option>
            <option value="SEDANG_DIKERJAKAN">Sedang dikerjakan</option>
          </select>

          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari nama atau email peserta..."
            className="col-span-2 h-11 rounded-[12px] border border-[#e2e6e4] bg-[#f7f9f8] px-3.5 text-[13px] text-[#16233f] placeholder:text-[#9aa4b2] shadow-[inset_0_1px_2px_rgba(22,35,63,0.04)] outline-none transition-all focus:border-[#059669] focus:bg-white focus:ring-2 focus:ring-[#059669]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 sm:col-span-1 sm:min-w-[220px] sm:flex-1"
          />

          <button
            type="submit"
            className="col-span-2 inline-flex h-11 items-center justify-center rounded-[12px] bg-gradient-to-b from-[#1c2b4d] to-[#101b33] px-5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_18px_-8px_rgba(16,27,51,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_14px_22px_-8px_rgba(16,27,51,0.7)] active:translate-y-0 dark:from-white/15 dark:to-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_18px_-8px_rgba(0,0,0,0.5)] sm:col-span-1 sm:w-auto"
          >
            Terapkan filter
          </button>
        </form>
      </Card>

      <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 dark:ring-white/10">
        <div className="relative">
          <div className="overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] [touch-action:pan-x]">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="bg-[#f7f9f8] text-[11.5px] uppercase tracking-wide text-[#8b93a6] dark:bg-white/[0.03] dark:text-white/40">
                <tr>
                  <th className="px-5 py-3">Peserta</th>
                  <th className="px-5 py-3">Ujian</th>
                  <th className="px-5 py-3">Skor</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Waktu Selesai</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarHasil.map((hasil) => {
                  const totalPoin = hasil.ujian.soal.reduce((total, soal) => total + soal.poin, 0)
                  return (
                    <tr
                      key={hasil.id}
                      className="border-t border-[#f0f2f1] transition-colors hover:bg-[#fafcfb] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#16233f] dark:text-white">{hasil.user.nama}</p>
                        <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">{hasil.user.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#5b657d] dark:text-white/50">{hasil.ujian.judul}</td>
                      <td className="px-5 py-3.5 font-medium text-[#16233f] dark:text-white">
                        {hasil.skor !== null ? `${hasil.skor} / ${totalPoin}` : "-"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={hasil.status === "SELESAI" ? "emerald" : "amber"}>
                          {hasil.status === "SELESAI" ? "Selesai" : "Dikerjakan"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#5b657d] dark:text-white/50">
                        {hasil.waktuSelesai ? hasil.waktuSelesai.toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/ujian/${hasil.ujianId}/hasil`}
                          className="font-medium text-[#059669] hover:underline dark:text-[#6ee7b7]"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  )
                })}

                {daftarHasil.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#8b93a6] dark:text-white/40">
                      Belum ada data nilai yang cocok dengan filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-[#101a30] sm:hidden"
            aria-hidden="true"
          />
        </div>
      </Card>
    </div>
  )
}