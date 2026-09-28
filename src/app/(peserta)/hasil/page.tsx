import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconChevronRight, IconAlertTriangle } from "@/components/ui/Icons"
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

/* =========================================================
   FORMAT & HELPER
========================================================= */

const formatTanggal = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(value)

const formatJam = (value: Date) =>
  `${new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(value)} WIB`

type ToneSkor = "emerald" | "amber" | "red" | "slate"

function toneSkor(skor: number | null): ToneSkor {
  if (skor === null) return "slate"
  if (skor >= 80) return "emerald"
  if (skor >= 60) return "amber"
  return "red"
}

const warnaSkor: Record<ToneSkor, string> = {
  emerald: "bg-[#ecfdf5] text-[#047857] dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-[#fff7e6] text-[#b45309] dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-[#fdf1f1] text-[#c53030] dark:bg-red-500/10 dark:text-red-300",
  slate: "bg-[#f1f3f7] text-[#5b657d] dark:bg-white/5 dark:text-white/60",
}

function formatSkor(skor: number | null) {
  if (skor === null) return "-"
  return Number.isInteger(skor) ? String(skor) : skor.toFixed(1)
}

/* =========================================================
   HALAMAN DAFTAR HASIL
   Route: /hasil  →  detail ada di /hasil/[id]
========================================================= */

export default async function HasilNilaiPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return null

  const daftarHasil = await prisma.hasilUjian.findMany({
    where: {
      userId,
      status: { not: "SEDANG_DIKERJAKAN" },
    },
    orderBy: { waktuMulai: "desc" },
    select: {
      id: true,
      skor: true,
      waktuMulai: true,
      waktuSelesai: true,
      jumlahPelanggaran: true,
      ujian: {
        select: {
          judul: true,
          mataPelajaran: true,
          namaGuru: true,
        },
      },
    },
  })

  const totalUjian = daftarHasil.length
  const skorTerisi = daftarHasil
    .map((hasil) => hasil.skor)
    .filter((skor): skor is number => typeof skor === "number")

  const rataRata =
    skorTerisi.length > 0 ? skorTerisi.reduce((total, skor) => total + skor, 0) / skorTerisi.length : null
  const tertinggi = skorTerisi.length > 0 ? Math.max(...skorTerisi) : null

  return (
    <div className="flex flex-col gap-6">
      {/* ==================== HEADER ==================== */}
      <div>
        <p className="text-[12.5px] font-medium text-[#b45309]">Hasil</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[#16233f] dark:text-white">Hasil &amp; Nilai</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86] dark:text-white/50">
          Lihat nilai dan pembahasan dari setiap ujian yang sudah Anda selesaikan.
        </p>
      </div>

      {/* ==================== RINGKASAN ==================== */}
      <div className="grid grid-cols-3 gap-3">
        <RingkasanItem label="Ujian selesai" value={String(totalUjian)} />
        <RingkasanItem label="Rata-rata" value={rataRata !== null ? formatSkor(Math.round(rataRata * 10) / 10) : "-"} />
        <RingkasanItem label="Tertinggi" value={formatSkor(tertinggi)} />
      </div>

      {/* ==================== DAFTAR HASIL ==================== */}
      {daftarHasil.length === 0 ? (
        <Card className="flex flex-col items-center gap-1.5 border-[#e9ecf2] px-6 py-12 text-center dark:border-white/10">
          <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">Belum ada hasil ujian</p>
          <p className="max-w-sm text-[12.5px] text-[#5b6a86] dark:text-white/50">
            Hasil akan muncul di sini setelah Anda menyelesaikan ujian.
          </p>
          <Link
            href="/ujian-tersedia"
            className="mt-3 inline-flex items-center rounded-[10px] bg-[#16233f] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1f2f52]"
          >
            Lihat ujian tersedia
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {daftarHasil.map((hasil) => {
            const tanggal = hasil.waktuSelesai ?? hasil.waktuMulai
            const tone = toneSkor(hasil.skor)
            const keterangan = [hasil.ujian.mataPelajaran, hasil.ujian.namaGuru].filter(Boolean).join(" • ")

            return (
              <Link key={hasil.id} href={`/hasil/${hasil.id}`} className="group block">
                <Card className="flex items-center gap-3 border-[#e9ecf2] p-3.5 shadow-[0_4px_0_#eef0f4,0_14px_24px_-16px_rgba(22,35,63,0.22)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_0_#e7eaf1,0_18px_30px_-16px_rgba(22,35,63,0.28)] dark:border-white/10 dark:shadow-[0_4px_0_#0f1830,0_14px_24px_-16px_rgba(0,0,0,0.5)] sm:gap-4 sm:p-4">
                  <Image
                    src={getSubjectIconSrc(hasil.ujian.judul)}
                    alt=""
                    width={40}
                    height={40}
                    className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_5px_7px_rgba(22,35,63,0.2)] sm:h-10 sm:w-10"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-[#16233f] dark:text-white">
                      {hasil.ujian.judul}
                    </p>
                    {keterangan && (
                      <p className="truncate text-[11.5px] text-[#5b6a86] dark:text-white/50">{keterangan}</p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[11.5px] text-[#8b93a6]">
                        {formatTanggal(tanggal)} · {formatJam(tanggal)}
                      </p>
                      {hasil.jumlahPelanggaran > 0 && (
                        <Badge tone="red" className="items-center gap-1">
                          <IconAlertTriangle className="h-3 w-3" />
                          {hasil.jumlahPelanggaran} pelanggaran
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex h-12 min-w-[52px] shrink-0 flex-col items-center justify-center rounded-[12px] px-2.5 ${warnaSkor[tone]}`}
                  >
                    <span className="text-[10px] font-medium uppercase leading-none opacity-70">Skor</span>
                    <span className="mt-1 text-[17px] font-bold leading-none">{formatSkor(hasil.skor)}</span>
                  </div>

                  <IconChevronRight className="hidden h-4 w-4 shrink-0 text-[#b3bacb] transition-transform group-hover:translate-x-0.5 sm:block" />
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   KARTU RINGKASAN
========================================================= */

function RingkasanItem({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col justify-center gap-0.5 border-[#e9ecf2] px-3.5 py-3 dark:border-white/10">
      <p className="text-[20px] font-semibold leading-none text-[#16233f] dark:text-white sm:text-[22px]">{value}</p>
      <p className="text-[11px] font-medium text-[#8b93a6] dark:text-white/50 sm:text-[12px]">{label}</p>
    </Card>
  )
}