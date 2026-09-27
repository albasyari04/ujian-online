import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { IconChevronLeft, IconChevronRight, IconSearch } from "@/components/ui/Icons"
// NOTE: sesuaikan path import ini dengan lokasi file subject-icons.ts di proyek Anda
// (mis. "@/lib/subject-icons" atau "@/utils/subject-icons").
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

const PER_HALAMAN = 8

/* =========================================================
   IKON LOKAL
   IconRiwayat belum ada di components/ui/Icons.tsx (dulu hanya
   didefinisikan lokal di SidebarPeserta.tsx), jadi didefinisikan
   ulang di sini agar konsisten secara visual.
========================================================= */

function IconRiwayat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4.5 12C4.5 7.9 7.9 4.5 12 4.5C16.1 4.5 19.5 7.9 19.5 12C19.5 16.1 16.1 19.5 12 19.5C9.6 19.5 7.4 18.3 6.1 16.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M3.5 17V13.5H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.5V12.3L14.6 13.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* =========================================================
   FORMAT & HELPER
========================================================= */

const formatTanggalSingkat = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(value)

const formatJam = (value: Date) =>
  `${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(value)} WIB`

function formatDurasi(menit: number) {
  if (menit < 1) return "< 1 menit"
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`
}

/** Durasi pengerjaan aktual peserta, dari mulai sampai submit. */
function hitungDurasiPengerjaan(waktuMulai: Date, waktuSelesai: Date) {
  const menit = Math.max(0, Math.round((waktuSelesai.getTime() - waktuMulai.getTime()) / 60_000))
  return formatDurasi(menit)
}

/** Warna badge skor hanya indikator visual relatif — sesuaikan ambang batas sesuai kebutuhan. */
function toneSkor(skor: number | null): "emerald" | "amber" | "red" | "slate" {
  if (skor === null) return "slate"
  if (skor >= 80) return "emerald"
  if (skor >= 60) return "amber"
  return "red"
}

function buildQueryString(params: { q?: string; page?: number }) {
  const usp = new URLSearchParams()
  if (params.q) usp.set("q", params.q)
  if (params.page && params.page > 1) usp.set("page", String(params.page))
  const query = usp.toString()
  return query ? `?${query}` : ""
}

/* =========================================================
   TIPE
========================================================= */

type ItemRiwayat = {
  hasilId: string
  ujianId: string
  judul: string
  durasiMenit: number
  totalSoal: number
  skor: number | null
  jumlahPelanggaran: number
  waktuMulai: Date
  waktuSelesai: Date
}

type SearchParams = { q?: string; page?: string }

/* =========================================================
   HALAMAN
========================================================= */

export default async function RiwayatUjianPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const { q, page: pageParam } = await searchParams
  const kataKunci = q?.trim() || undefined
  const halamanSekarang = Math.max(1, Number(pageParam) || 1)

  const where: Prisma.HasilUjianWhereInput = {
    userId,
    status: "SELESAI",
    ...(kataKunci
      ? {
          ujian: {
            judul: { contains: kataKunci },
          },
        }
      : {}),
  }

  const [totalData, agregat, hasilList] = await Promise.all([
    prisma.hasilUjian.count({ where }),
    prisma.hasilUjian.aggregate({
      where,
      _avg: { skor: true },
      _sum: { jumlahPelanggaran: true },
    }),
    prisma.hasilUjian.findMany({
      where,
      include: {
        ujian: {
          select: {
            id: true,
            judul: true,
            durasiMenit: true,
            soal: { select: { id: true } },
          },
        },
      },
      orderBy: { waktuSelesai: "desc" },
      skip: (halamanSekarang - 1) * PER_HALAMAN,
      take: PER_HALAMAN,
    }),
  ])

  const totalHalaman = Math.max(1, Math.ceil(totalData / PER_HALAMAN))
  const halamanValid = Math.min(halamanSekarang, totalHalaman)

  const daftar: ItemRiwayat[] = hasilList.map((hasil) => ({
    hasilId: hasil.id,
    ujianId: hasil.ujian.id,
    judul: hasil.ujian.judul,
    durasiMenit: hasil.ujian.durasiMenit,
    totalSoal: hasil.ujian.soal.length,
    skor: hasil.skor,
    jumlahPelanggaran: hasil.jumlahPelanggaran,
    waktuMulai: hasil.waktuMulai,
    waktuSelesai: hasil.waktuSelesai ?? hasil.waktuMulai,
  }))

  const rataRataSkor = agregat._avg.skor
  const totalPelanggaran = agregat._sum.jumlahPelanggaran ?? 0

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309] dark:text-amber-400">Riwayat pengerjaan</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f] dark:text-white">Riwayat Ujian</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86] dark:text-white/50">
          Semua ujian yang sudah Anda selesaikan, lengkap dengan skor dan catatan pelanggaran.
        </p>
      </header>

      {/* =========================================================
          RINGKASAN
          Sekarang memakai StatCard — komponen & style yang SAMA
          persis dengan card ringkasan di halaman Jadwal Ujian
          (icon polos kanan-atas, angka besar, efek gradient/
          shadow 3D, grid 3 kolom dengan gap yang mengecil di
          layar sempit).
      ========================================================= */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          label="Ujian selesai"
          value={totalData}
          description="ujian yang telah diselesaikan"
          iconImageSrc="/image/icon/ujian-selesai.png"
          tone="emerald"
        />
        <StatCard
          label="Rata-rata skor"
          value={rataRataSkor !== null ? rataRataSkor.toFixed(1) : "-"}
          description="dari semua ujian yang diikuti"
          iconImageSrc="/image/icon/rata-rata-score.png"
          tone="blue"
        />
        <StatCard
          label="Total pelanggaran"
          value={totalPelanggaran}
          description="tercatat selama ujian"
          iconImageSrc="/image/icon/total-pelanggaran.png"
          tone="red"
        />
      </div>

      <form
        method="GET"
        className="flex items-center gap-2 rounded-[16px] border border-[#e7e4dc] bg-white p-2.5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_10px_20px_-12px_rgba(49,46,129,0.16)] dark:border-white/10 dark:bg-[#101a30]"
      >
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8] dark:text-white/30" />
          <Input
            type="search"
            name="q"
            defaultValue={kataKunci ?? ""}
            placeholder="Cari nama ujian..."
            aria-label="Cari nama ujian"
            className="border-transparent bg-[#f6f5f1] pl-9 focus:border-[#6ee7b7] dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>
        <Button type="submit" size="md" className="shrink-0">
          <IconSearch className="h-4 w-4" />
          Cari
        </Button>
      </form>

      {daftar.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[18px] border border-[#e7e4dc] bg-white px-6 py-14 text-center shadow-[0_1px_2px_rgba(22,35,63,0.04),0_10px_24px_-12px_rgba(49,46,129,0.18)] dark:border-white/10 dark:bg-[#101a30]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f4f5f7] to-[#e2e5eb] text-[#5b657d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:from-white/10 dark:to-white/[0.02] dark:text-white/60">
            <IconRiwayat className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">
              {kataKunci ? "Tidak ada riwayat yang cocok" : "Belum ada riwayat ujian"}
            </p>
            <p className="mt-1 max-w-sm text-[13px] text-[#8b93a6] dark:text-white/40">
              {kataKunci
                ? "Coba gunakan kata kunci lain atau hapus pencarian untuk melihat semua riwayat."
                : "Riwayat akan muncul di sini setelah Anda menyelesaikan sebuah ujian."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {daftar.map((item) => (
              <ItemRiwayatCard key={item.hasilId} item={item} />
            ))}
          </div>

          {totalHalaman > 1 && (
            <Paginasi
              halamanSekarang={halamanValid}
              totalHalaman={totalHalaman}
              q={kataKunci}
            />
          )}
        </>
      )}
    </div>
  )
}

/* =========================================================
   KARTU RIWAYAT
========================================================= */

function ItemRiwayatCard({ item }: { item: ItemRiwayat }) {
  return (
    <Card className="group relative flex flex-col gap-3.5 overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_7px_0_#0d1424,0_24px_36px_-16px_rgba(0,0,0,0.68)] sm:flex-row sm:items-center sm:justify-between">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]" aria-hidden="true" />

      <div className="relative flex items-start gap-3">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#eef0f4] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_6px_14px_-6px_rgba(22,35,63,0.3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3 dark:from-white/10 dark:to-white/[0.02] sm:h-[54px] sm:w-[54px]">
          <Image
            src={getSubjectIconSrc(item.judul)}
            alt=""
            width={30}
            height={30}
            className="h-7 w-7 object-contain sm:h-8 sm:w-8"
          />
        </span>

        <div className="relative min-w-0">
          <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">{item.judul}</p>

          <p className="mt-1.5 text-[12px] text-[#8b93a6] dark:text-white/40">
            Diselesaikan {formatTanggalSingkat(item.waktuSelesai)} · {formatJam(item.waktuSelesai)}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="slate">{item.totalSoal} soal</Badge>
            <Badge tone="slate">Dikerjakan {hitungDurasiPengerjaan(item.waktuMulai, item.waktuSelesai)}</Badge>
            <Badge tone={toneSkor(item.skor)}>
              {item.skor !== null ? `Skor ${item.skor}` : "Menunggu penilaian"}
            </Badge>
            {item.jumlahPelanggaran > 0 && (
              <Badge tone="red">{item.jumlahPelanggaran} pelanggaran</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex justify-end border-t border-dashed border-[#e7e4dc] pt-3 dark:border-white/10 sm:border-0 sm:pt-0">
        <Link href={`/hasil/${item.hasilId}`}>
          <Button variant="outline" size="sm">
            Lihat hasil
          </Button>
        </Link>
      </div>
    </Card>
  )
}

/* =========================================================
   PAGINASI
========================================================= */

function Paginasi({
  halamanSekarang,
  totalHalaman,
  q,
}: {
  halamanSekarang: number
  totalHalaman: number
  q?: string
}) {
  const bisaMundur = halamanSekarang > 1
  const bisaMaju = halamanSekarang < totalHalaman

  return (
    <div className="flex items-center justify-between rounded-[16px] border border-[#e7e4dc] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_8px_16px_-12px_rgba(49,46,129,0.16)] dark:border-white/10 dark:bg-[#101a30]">
      <p className="text-[12px] text-[#8b93a6] dark:text-white/40">
        Halaman {halamanSekarang} dari {totalHalaman}
      </p>

      <div className="flex items-center gap-2">
        {bisaMundur ? (
          <Link href={`/riwayat${buildQueryString({ q, page: halamanSekarang - 1 })}`}>
            <Button variant="outline" size="sm">
              <IconChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <IconChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
        )}

        {bisaMaju ? (
          <Link href={`/riwayat${buildQueryString({ q, page: halamanSekarang + 1 })}`}>
            <Button variant="outline" size="sm">
              Berikutnya
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Berikutnya
            <IconChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}