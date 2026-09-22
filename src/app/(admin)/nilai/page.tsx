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

  return (
    <div className="flex flex-col gap-6">
      {/* Header halaman */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8863b] sm:text-[12px]">
            Ujian Online
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#16233f] sm:text-[26px]">Nilai</h1>
          <p className="mt-1 text-[12px] text-[#5b657d] sm:text-[13px]">
            Nilai peserta otomatis muncul di sini begitu ujian mereka selesai dikerjakan.
          </p>
        </div>

        <a
          href={`/api/nilai/export${queryString ? `?${queryString}` : ""}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#059669] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(5,150,105,0.25)] transition hover:bg-[#047857] hover:shadow-[0_8px_22px_rgba(5,150,105,0.35)] sm:px-4 sm:py-2.5 sm:text-[13px]"
        >
          {/* Ikon 3D unduh — warna asli dipertahankan, tanpa filter invert */}
          <Image 
            src="/image/icon/unduh-icon.png" 
            alt="Unduh Excel" 
            width={24} 
            height={24} 
            className="h-5 w-5 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] sm:h-6 sm:w-6" 
          />
          Unduh Excel
        </a>
      </div>

      {/* Grid StatCard 3 kolom agar jejer ke samping di mobile */}
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
          value={rataRata._avg.skor !== null ? rataRata._avg.skor.toFixed(1) : "-"}
          iconImageSrc="/image/icon/rata-rata-score.png"
          tone="slate"
        />
      </div>

      <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
        <form
          method="GET"
          className="flex flex-col gap-3 border-b border-[#edf0ef] px-5 py-4 sm:flex-row sm:items-center"
        >
          <select
            name="ujianId"
            defaultValue={ujianId ?? ""}
            className="rounded-[10px] border border-[#e2e6e4] bg-white px-3 py-2 text-[13px] text-[#16233f] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] sm:w-56"
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
            className="rounded-[10px] border border-[#e2e6e4] bg-white px-3 py-2 text-[13px] text-[#16233f] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] sm:w-48"
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
            className="flex-1 rounded-[10px] border border-[#e2e6e4] bg-white px-3 py-2 text-[13px] text-[#16233f] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
          />

          <button
            type="submit"
            className="rounded-[10px] bg-[#16233f] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f1a30] hover:shadow-lg"
          >
            Terapkan filter
          </button>
        </form>

        <div className="relative">
          <div className="overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] [touch-action:pan-x]">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="bg-[#f7f9f8] text-[11.5px] uppercase tracking-wide text-[#8b93a6]">
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
                    <tr key={hasil.id} className="border-t border-[#f0f2f1] transition-colors hover:bg-[#fafcfb]">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#16233f]">{hasil.user.nama}</p>
                        <p className="text-[11.5px] text-[#8b93a6]">{hasil.user.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#5b657d]">{hasil.ujian.judul}</td>
                      <td className="px-5 py-3.5 font-medium text-[#16233f]">
                        {hasil.skor !== null ? `${hasil.skor} / ${totalPoin}` : "-"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={hasil.status === "SELESAI" ? "emerald" : "amber"}>
                          {hasil.status === "SELESAI" ? "Selesai" : "Dikerjakan"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#5b657d]">
                        {hasil.waktuSelesai ? hasil.waktuSelesai.toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/ujian/${hasil.ujianId}/hasil`} className="font-medium text-[#059669] hover:underline">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  )
                })}

                {daftarHasil.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#8b93a6]">
                      Belum ada data nilai yang cocok dengan filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden"
            aria-hidden="true"
          />
        </div>
      </Card>
    </div>
  )
}