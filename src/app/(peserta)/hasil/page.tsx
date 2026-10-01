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

/** Kotak skor 3D: gradien tipis + highlight atas + lapisan tepi bawah berwarna senada. */
const warnaSkor: Record<ToneSkor, string> = {
  emerald:
    "bg-gradient-to-b from-[#f2fdf8] to-[#d3f7e5] text-[#047857] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_3px_0_#a7e9c9,0_9px_14px_-7px_rgba(4,120,87,0.4)] dark:from-emerald-400/15 dark:to-emerald-500/5 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_0_rgba(16,185,129,0.28),0_9px_14px_-7px_rgba(0,0,0,0.5)]",
  amber:
    "bg-gradient-to-b from-[#fffaf0] to-[#ffecc7] text-[#b45309] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_3px_0_#f5d48e,0_9px_14px_-7px_rgba(180,83,9,0.4)] dark:from-amber-400/15 dark:to-amber-500/5 dark:text-amber-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_0_rgba(245,158,11,0.28),0_9px_14px_-7px_rgba(0,0,0,0.5)]",
  red: "bg-gradient-to-b from-[#fff5f5] to-[#fddcdc] text-[#c53030] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_3px_0_#f4b4b4,0_9px_14px_-7px_rgba(197,48,48,0.4)] dark:from-red-400/15 dark:to-red-500/5 dark:text-red-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_0_rgba(239,68,68,0.28),0_9px_14px_-7px_rgba(0,0,0,0.5)]",
  slate:
    "bg-gradient-to-b from-[#f7f8fb] to-[#e6e9f0] text-[#5b657d] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_3px_0_#cfd5e1,0_9px_14px_-7px_rgba(22,35,63,0.3)] dark:from-white/10 dark:to-white/[0.03] dark:text-white/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_0_rgba(255,255,255,0.08),0_9px_14px_-7px_rgba(0,0,0,0.5)]",
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
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309] dark:text-amber-400">Hasil</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f] dark:text-white">Hasil &amp; Nilai</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86] dark:text-white/50">
          Lihat nilai dan pembahasan dari setiap ujian yang sudah Anda selesaikan.
        </p>
      </header>

      {/* ==================== RINGKASAN ==================== */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <RingkasanItem
          label="Ujian selesai"
          value={String(totalUjian)}
          description="ujian yang telah diselesaikan"
          iconSrc="/image/icon/selesai.png"
          tone="emerald"
        />
        <RingkasanItem
          label="Rata-rata"
          value={rataRata !== null ? formatSkor(Math.round(rataRata * 10) / 10) : "-"}
          description="dari semua ujian yang diikuti"
          iconSrc="/image/icon/rata-rata-score.png"
          tone="cyan"
        />
        <RingkasanItem
          label="Tertinggi"
          value={formatSkor(tertinggi)}
          description="nilai terbaik yang diraih"
          iconSrc="/image/icon/nilai-tertinggi-icon.png"
          tone="blue"
        />
      </div>

      {/* ==================== DAFTAR HASIL ==================== */}
      {daftarHasil.length === 0 ? (
        <Card className="flex flex-col items-center gap-1.5 border-[#e9ecf2] bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] px-6 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.3)] dark:border-white/10 dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)]">
          <p className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Belum ada hasil ujian</p>
          <p className="max-w-sm text-[12.5px] text-[#5b6a86] dark:text-white/50">
            Hasil akan muncul di sini setelah Anda menyelesaikan ujian.
          </p>
          <Link
            href="/ujian-tersedia"
            className="mt-4 inline-flex items-center rounded-[12px] bg-gradient-to-b from-[#2b4170] to-[#16233f] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_0_#0b152b,0_12px_18px_-8px_rgba(22,35,63,0.55)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_0_#0b152b,0_16px_22px_-8px_rgba(22,35,63,0.6)] active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#0b152b,0_4px_8px_-4px_rgba(22,35,63,0.5)]"
          >
            Lihat ujian tersedia
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {daftarHasil.map((hasil) => {
            const tanggal = hasil.waktuSelesai ?? hasil.waktuMulai
            const tone = toneSkor(hasil.skor)
            const keterangan = [hasil.ujian.mataPelajaran, hasil.ujian.namaGuru].filter(Boolean).join(" • ")

            return (
              <Link key={hasil.id} href={`/hasil/${hasil.id}`} className="group block">
                <Card className="relative flex items-center gap-3 overflow-hidden border-[#e9ecf2] bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] group-active:translate-y-0 group-active:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_0_#e3e7ee,0_8px_16px_-10px_rgba(22,35,63,0.3)] dark:border-white/10 dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] dark:group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_7px_0_#0d1424,0_24px_36px_-16px_rgba(0,0,0,0.68)] sm:gap-4 sm:p-4">
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]"
                    aria-hidden="true"
                  />

                  {/* Medali ikon mata pelajaran */}
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#eef0f4] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_6px_14px_-6px_rgba(22,35,63,0.3)] transition-transform duration-300 group-hover:rotate-3 dark:from-white/10 dark:to-white/[0.02] sm:h-[50px] sm:w-[50px]">
                    <Image
                      src={getSubjectIconSrc(hasil.ujian.judul)}
                      alt=""
                      width={40}
                      height={40}
                      className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                    />
                  </span>

                  <div className="relative min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-[#16233f] dark:text-white">
                      {hasil.ujian.judul}
                    </p>
                    {keterangan && (
                      <p className="truncate text-[11.5px] text-[#5b6a86] dark:text-white/50">{keterangan}</p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">
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

                  {/* Kotak skor 3D */}
                  <div
                    className={`relative mb-[3px] flex h-12 min-w-[54px] shrink-0 flex-col items-center justify-center rounded-[12px] px-2.5 ${warnaSkor[tone]}`}
                  >
                    <span className="text-[10px] font-medium uppercase leading-none opacity-70">Skor</span>
                    <span className="mt-1 text-[17px] font-bold leading-none">{formatSkor(hasil.skor)}</span>
                  </div>

                  {/* Tombol panah 3D */}
                  <span className="relative hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-white to-[#eceff4] text-[#8b93a6] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_3px_0_#dfe3ea,0_8px_12px_-6px_rgba(22,35,63,0.3)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#16233f] dark:from-white/10 dark:to-white/[0.03] dark:text-white/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_0_rgba(255,255,255,0.06),0_8px_12px_-6px_rgba(0,0,0,0.5)] dark:group-hover:text-white sm:flex">
                    <IconChevronRight className="h-4 w-4" />
                  </span>
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
   KARTU RINGKASAN 3D
   Ikon berada di pojok kanan atas. Di layar sempit ikon
   diperkecil & deskripsi disembunyikan supaya 3 kartu tetap
   muat dalam satu baris.
========================================================= */

type ToneRingkasan = "emerald" | "cyan" | "blue"

const glowRingkasan: Record<ToneRingkasan, string> = {
  emerald: "bg-emerald-400/25 dark:bg-emerald-400/15",
  cyan: "bg-cyan-400/25 dark:bg-cyan-400/15",
  blue: "bg-blue-500/20 dark:bg-blue-500/15",
}

function RingkasanItem({
  label,
  value,
  description,
  iconSrc,
  tone,
}: {
  label: string
  value: string
  description: string
  iconSrc: string
  tone: ToneRingkasan
}) {
  return (
    <div className="group relative flex flex-col gap-1.5 overflow-hidden rounded-[18px] border border-[#e7e4dc] bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] dark:border-white/10 dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_7px_0_#0d1424,0_24px_36px_-16px_rgba(0,0,0,0.68)] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl ${glowRingkasan[tone]}`}
        aria-hidden="true"
      />

      {/* Ikon — kanan atas (mobile: baris pertama rata kanan, desktop: sisi kanan) */}
      <span className="relative order-first flex h-9 w-9 shrink-0 items-center justify-center self-end sm:order-last sm:h-14 sm:w-14 sm:self-auto">
        <Image
          src={iconSrc}
          alt=""
          width={64}
          height={64}
          className="h-full w-full object-contain drop-shadow-[0_6px_8px_rgba(22,35,63,0.28)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3 group-hover:scale-105"
        />
      </span>

      <div className="relative min-w-0">
        <p className="truncate text-[11px] font-medium text-[#5b6a86] dark:text-white/50 sm:text-[12.5px]">{label}</p>
        <p className="mt-0.5 text-[22px] font-semibold leading-none text-[#16233f] dark:text-white sm:mt-1 sm:text-[28px]">
          {value}
        </p>
        <p className="mt-1.5 hidden text-[11.5px] leading-snug text-[#8b93a6] dark:text-white/40 sm:block">
          {description}
        </p>
      </div>
    </div>
  )
}