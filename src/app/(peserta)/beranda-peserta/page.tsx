import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, FiturBadge, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import {
  IconBook,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconLightbulb,
} from "@/components/ui/Icons"

export const dynamic = "force-dynamic"

/* =========================================================
   ILUSTRASI DEKORATIF
   Semua ilustrasi (hero, empty state kalender, empty state sorotan)
   pakai gambar asli di public/image/ dan public/image/icon/.
========================================================= */

/* =========================================================
   FORMATTER
========================================================= */

const formatTanggalSingkat = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(value)

const formatJam = (value: Date) =>
  `${new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(value)} WIB`

function formatDurasi(menit: number) {
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`
}

const dateKey = (value: Date) => `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function buildKalender(acuan: Date) {
  const tahun = acuan.getFullYear()
  const bulan = acuan.getMonth()
  const offset = new Date(tahun, bulan, 1).getDay()
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()

  const sel: Array<{ tanggal: number; key: string } | null> = []
  for (let i = 0; i < offset; i++) sel.push(null)
  for (let d = 1; d <= jumlahHari; d++) sel.push({ tanggal: d, key: `${tahun}-${bulan}-${d}` })
  while (sel.length % 7 !== 0) sel.push(null)

  const minggu: Array<typeof sel> = []
  for (let i = 0; i < sel.length; i += 7) minggu.push(sel.slice(i, i + 7))
  return minggu
}

/* =========================================================
   HALAMAN
========================================================= */

export default async function BerandaPesertaPage({
  searchParams,
}: {
  searchParams?: Promise<{ bulan?: string }>
}) {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const params = (await searchParams) ?? {}
  const offsetBulan = Number.parseInt(params.bulan ?? "0", 10) || 0

  const sekarang = new Date()
  const hasilSaya = await prisma.hasilUjian.findMany({
    where: { userId },
    include: { ujian: { select: { id: true, judul: true, durasiMenit: true } } },
    orderBy: { waktuMulai: "desc" },
  })
  const sudahDiambil = new Set(hasilSaya.map((hasil) => hasil.ujianId))
  const ujianAktif = await prisma.ujian.findMany({
    where: { mulai: { lte: sekarang }, selesai: { gte: sekarang } },
    include: { soal: { select: { id: true } } },
    orderBy: { selesai: "asc" },
  })

  const sedangDikerjakan = hasilSaya.filter((hasil) => hasil.status === "SEDANG_DIKERJAKAN")
  const tersedia = ujianAktif.filter((ujian) => !sudahDiambil.has(ujian.id))
  const selesai = hasilSaya.filter((hasil) => hasil.status === "SELESAI")
  const rataRata = selesai.length > 0 ? selesai.reduce((total, hasil) => total + (hasil.skor ?? 0), 0) / selesai.length : null
  const namaDepan = (session.user.name ?? "Peserta").trim().split(" ")[0]

  // Bulan yang sedang ditampilkan di kalender (bisa digeser lewat ?bulan=-1 / ?bulan=1)
  const acuanKalender = new Date(sekarang.getFullYear(), sekarang.getMonth() + offsetBulan, 1)
  const namaBulan = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(acuanKalender)

  const tandaiTanggal = new Set<string>()
  ujianAktif.forEach((ujian) => {
    tandaiTanggal.add(dateKey(ujian.mulai))
    tandaiTanggal.add(dateKey(ujian.selesai))
  })
  const kunciHariIni = dateKey(sekarang)
  const minggu = buildKalender(acuanKalender)

  return (
    <div className="flex flex-col gap-6">
      {/* ===================== HERO / SAMBUTAN ===================== */}
      <Card className="relative isolate min-h-[280px] overflow-hidden p-0 sm:min-h-[320px]">
        {/* Banner latar — gelombang biru, ilustrasi laptop/buku/topi wisuda, dan 2 ikon
            melayang (dokumen-centang & wifi) sudah menyatu di dalam gambar ini sendiri,
            jadi tidak perlu overlay putih tebal di atasnya seperti sebelumnya. */}
        <Image
          src="/image/banner/beranda-banner.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Konten teks — dibatasi ke area terang di sisi kiri gambar */}
        <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-6 sm:gap-3.5 sm:p-8 md:max-w-[60%] lg:max-w-[56%]">
          <h1 className="text-[24px] font-bold leading-[1.15] text-[#16233f] dark:text-white sm:text-[32px]">
            Selamat datang,
            <br />
            <span className="text-[#2a5cd6] dark:text-[#8fb1ff]">{namaDepan}</span>
          </h1>

          <p className="max-w-[300px] text-[12.5px] text-[#5b6a86] dark:text-white/60 sm:text-[13.5px]">
            Berikut ringkasan ujian dan hasil belajar Anda.
          </p>

          {/* 3 badge fitur sejajar satu baris di layar sm ke atas; di layar kecil (hp)
              tetap boleh turun ke baris berikutnya (flex-wrap) supaya tidak kepotong. */}
          <div className="mt-1.5 flex flex-wrap gap-2 sm:flex-nowrap">
            <FiturBadge
              iconImageSrc="/image/icon/dockumen.png"
              title="Ujian Online"
              subtitle="Mudah & Praktis"
              tone="blue"
            />
            <FiturBadge
              iconImageSrc="/image/icon/hasil-belajar.png"
              title="Hasil Belajar"
              subtitle="Pantau Perkembangan"
              tone="violet"
            />
            <FiturBadge
              iconImageSrc="/image/icon/aman-terpercaya.png"
              title="Aman & Terpercaya"
              subtitle="Data Anda Terlindungi"
              tone="emerald"
            />
          </div>
        </div>

      </Card>

      {/* ===================== STAT CARDS ===================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Ujian Tersedia"
          value={tersedia.length}
          description="ujian yang dapat dikerjakan"
          iconImageSrc="/image/icon/ujian-tersedia.png"
          tone="blue"
          href="/ujian-tersedia"
        />
        <StatCard
          label="Sedang Dikerjakan"
          value={sedangDikerjakan.length}
          description="ujian yang sedang berlangsung"
          iconImageSrc="/image/icon/ujian-sedang-dikerjakan.png"
          tone="violet"
          href="/ujian-berlangsung"
        />
        <StatCard
          label="Ujian Selesai"
          value={selesai.length}
          description="ujian yang telah diselesaikan"
          iconImageSrc="/image/icon/ujian-selesai.png"
          tone="amber"
          href="/riwayat"
        />
        <StatCard
          label="Rata-rata Skor"
          value={rataRata === null ? "-" : rataRata.toFixed(1)}
          description="dari semua ujian yang diikuti"
          iconImageSrc="/image/icon/nilai-rata2-icon.png"
          tone="emerald"
          href="/statistik"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===================== KOLOM UTAMA ===================== */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {sedangDikerjakan.length > 0 && (
            <section className="flex flex-col gap-3">
              {sedangDikerjakan.map((hasil) => (
                <Card key={hasil.id} className="flex flex-col gap-3.5 border-[#f0d9ad] bg-[#fdf6e7] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                      <Image
                        src={getSubjectIconSrc(hasil.ujian.judul)}
                        alt={hasil.ujian.judul}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.16)]"
                      />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#16233f]">Ujian sedang berlangsung</p>
                      <p className="text-[13px] text-[#8a6a2f]">{hasil.ujian.judul}</p>
                      <p className="mt-0.5 text-[11.5px] text-[#a3854f]">Lanjutkan sebelum waktu pengerjaan habis.</p>
                    </div>
                  </div>
                  <Link href={`/ujian/${hasil.ujian.id}`} className="shrink-0">
                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                      Lanjutkan ujian
                    </Button>
                  </Link>
                </Card>
              ))}
            </section>
          )}

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#16233f]">
                <IconBook className="h-[18px] w-[18px] text-[#3457c9]" />
                Ujian Tersedia
              </h2>
              {tersedia.length > 0 && <Badge tone="blue">{tersedia.length} aktif</Badge>}
            </div>

            {tersedia.length === 0 ? (
              <EmptyState
                text="Belum ada ujian yang bisa dikerjakan saat ini."
                hint="Silakan cek kembali nanti untuk melihat ujian yang tersedia."
                illustration={
                  <Image
                    src="/image/icon/jadwal-icon.png"
                    alt="Belum ada ujian tersedia"
                    width={140}
                    height={110}
                    className="h-[100px] w-auto object-contain"
                  />
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tersedia.map((ujian) => (
                  <Card key={ujian.id} className="flex flex-col gap-4 p-4">
                    <div>
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                          <Image
                            src={getSubjectIconSrc(ujian.judul)}
                            alt={ujian.judul}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.16)]"
                          />
                        </span>
                        <p className="mt-1 text-[14px] font-semibold leading-snug text-[#16233f]">{ujian.judul}</p>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Badge tone="slate">{formatDurasi(ujian.durasiMenit)}</Badge>
                        <Badge tone="slate">{ujian.soal.length} soal</Badge>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#efece4] pt-3">
                      <p className="text-[11px] text-[#8b93a6]">
                        Tutup {formatTanggalSingkat(ujian.selesai)}, {formatJam(ujian.selesai)}
                      </p>
                      <Link href={`/ujian/${ujian.id}`}>
                        <Button size="sm">Mulai</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#16233f]">
                <IconClock className="h-[18px] w-[18px] text-[#8b93a6]" />
                Riwayat Ujian
              </h2>
              {selesai.length > 0 && (
                <Link href="/riwayat" className="text-[12.5px] font-medium text-[#3457c9] hover:underline">
                  Lihat Semua
                </Link>
              )}
            </div>

            {selesai.length === 0 ? (
              <EmptyState text="Anda belum menyelesaikan ujian apa pun." />
            ) : (
              <Card className="divide-y divide-[#efece4] overflow-hidden">
                {selesai.slice(0, 10).map((hasil) => (
                  <div key={hasil.id} className="flex items-center gap-3 px-4 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                      <Image
                        src={getSubjectIconSrc(hasil.ujian.judul)}
                        alt={hasil.ujian.judul}
                        width={36}
                        height={36}
                        className="h-9 w-9 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.16)]"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-[#16233f]">{hasil.ujian.judul}</p>
                      <p className="text-[12px] text-[#8b93a6]">
                        {hasil.waktuSelesai ? formatTanggalSingkat(hasil.waktuSelesai) : "-"}
                      </p>
                    </div>
                    <Badge tone="emerald" className="shrink-0 text-[12.5px]">
                      {hasil.skor === null ? "-" : hasil.skor.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </Card>
            )}
          </section>
        </div>

        {/* ===================== PANEL KANAN ===================== */}
        <div className="flex flex-col gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-semibold capitalize text-[#16233f]">{namaBulan}</p>
              <div className="flex items-center gap-1">
                <Link
                  href={`?bulan=${offsetBulan - 1}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b93a6] hover:bg-[#f0efe8]"
                  aria-label="Bulan sebelumnya"
                >
                  <IconChevronLeft className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`?bulan=${offsetBulan + 1}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b93a6] hover:bg-[#f0efe8]"
                  aria-label="Bulan berikutnya"
                >
                  <IconChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
              {HARI.map((hari) => (
                <span key={hari} className="text-[10.5px] font-medium text-[#8b93a6]">
                  {hari}
                </span>
              ))}

              {minggu.map((mgg, i) =>
                mgg.map((hari, j) => {
                  if (!hari) return <span key={`${i}-${j}`} />
                  const aktif = tandaiTanggal.has(hari.key)
                  const iniHari = hari.key === kunciHariIni
                  return (
                    <span
                      key={hari.key}
                      className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] ${
                        iniHari
                          ? "bg-[#16233f] font-semibold text-white"
                          : aktif
                            ? "font-medium text-[#b45309]"
                            : "text-[#54627e]"
                      }`}
                    >
                      {hari.tanggal}
                      {aktif && !iniHari && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#e8a33d]" aria-hidden="true" />
                      )}
                    </span>
                  )
                })
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold text-[#16233f]">
                <IconLightbulb className="h-4 w-4 text-[#e8a33d]" />
                Sorotan Ujian
              </p>
              {tersedia.length > 0 ? (
                <Badge tone="amber">{tersedia.length} tersedia</Badge>
              ) : (
                <Link href="/ujian-tersedia" className="text-[11.5px] font-medium text-[#3457c9] hover:underline">
                  Lihat Semua
                </Link>
              )}
            </div>

            {tersedia.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-[#e7e4dc] px-3.5 py-6 text-center">
                <Image
                  src="/image/icon/pencarian-icon.png"
                  alt="Tidak ada ujian yang disorot"
                  width={110}
                  height={80}
                  className="h-[76px] w-auto object-contain"
                />
                <p className="text-[12.5px] text-[#8b93a6]">Tidak ada ujian yang perlu disorot saat ini.</p>
                <p className="text-[11px] text-[#a3aebd]">Ujian yang penting akan muncul di sini.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {tersedia.slice(0, 4).map((ujian) => (
                  <Link
                    key={ujian.id}
                    href={`/ujian/${ujian.id}`}
                    className="flex items-center gap-3 rounded-[12px] border border-[#f0d9ad] bg-[#fdf6e7] px-3 py-2.5 transition-colors hover:bg-[#fbeed0]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                      <Image
                        src={getSubjectIconSrc(ujian.judul)}
                        alt={ujian.judul}
                        width={36}
                        height={36}
                        className="h-9 w-9 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.16)]"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-[#16233f]">{ujian.judul}</p>
                      <p className="truncate text-[11px] text-[#8a6a2f]">
                        Tutup {formatTanggalSingkat(ujian.selesai)}, {formatJam(ujian.selesai)}
                      </p>
                    </div>
                  </Link>
                ))}

                {tersedia.length > 4 && (
                  <p className="pt-0.5 text-center text-[11.5px] text-[#8b93a6]">
                    +{tersedia.length - 4} ujian lainnya tersedia
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  text,
  hint,
  illustration,
}: {
  text: string
  hint?: string
  illustration?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-[#e7e4dc] bg-white/60 px-4 py-8 text-center">
      {illustration}
      <p className="text-[13px] font-medium text-[#16233f]">{text}</p>
      {hint && <p className="text-[12px] text-[#8b93a6]">{hint}</p>}
    </div>
  )
}