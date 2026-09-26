import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { CalendarCard } from "@/components/ui/CalendarCard"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import { IconBook, IconChevronRight, IconClock, IconLightbulb, IconSend } from "@/components/ui/Icons"

export const dynamic = "force-dynamic"

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

/* =========================================================
   HALAMAN
========================================================= */

export default async function BerandaPesertaPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

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

  // Tanggal yang ditandai di kalender: rentang aktif ujian yang sedang berjalan.
  const markedDates: Record<string, "berlangsung" | "akan_datang" | "berakhir"> = {}
  ujianAktif.forEach((ujian) => {
    markedDates[dateKey(ujian.mulai)] = "berlangsung"
    markedDates[dateKey(ujian.selesai)] = "berlangsung"
  })
  const kunciHariIni = dateKey(sekarang)

  return (
    <div className="flex flex-col gap-6">
      {/* ===================== HERO / SAMBUTAN ===================== */}
      {/* Foto banner (banner-peserta-beranda.jpg) di area kiri-atas SUDAH biru gelap dengan
          sendirinya (sisa desain asli setelah teks bahasa Inggris & tombolnya dihapus dari
          gambar), jadi teks sambutan kita bisa langsung ditempel di atasnya TANPA gradient/
          overlay tambahan — persis seperti referensi banner-peserta-beranda-desain.png.

          Rasio gambar asli (1769:592) dipakai apa adanya di SEMUA ukuran layar (bukan cuma
          mobile), jadi banner tidak pernah dipotong sedikit pun, di HP maupun desktop. Supaya
          teks tetap muat rapi walau banner jadi pendek di layar sempit, semua ukuran teks &
          padding memakai satuan vw (persentase lebar layar) via clamp() — jadi teks ikut
          mengecil/membesar proporsional mengikuti lebar banner, sama seperti kalau teks itu
          betulan bagian dari gambar. */}
      <div
        className="relative w-full overflow-hidden rounded-[18px] min-h-[108px]"
        style={{ aspectRatio: "1769 / 592" }}
      >
        <Image
          src="/image/banner/banner-peserta-beranda.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div
          className="absolute inset-0 z-10 flex flex-col justify-center gap-[0.6vw] px-[4vw] py-[1.5vw] sm:max-w-[55%] lg:max-w-[46%]"
        >
          <h1 className="leading-[1.15] text-white drop-shadow-[0_1px_4px_rgba(10,42,99,0.45)]">
            <span
              className="block font-normal"
              style={{ fontSize: "clamp(10px, 2.3vw, 22px)" }}
            >
              Selamat datang, <span aria-hidden="true">👋</span>
            </span>
            <span
              className="block font-bold text-[#8fd0ff]"
              style={{ fontSize: "clamp(15px, 4.2vw, 40px)", lineHeight: 1.1 }}
            >
              {namaDepan}
            </span>
          </h1>

          <p
            className="max-w-[92%] text-white/85 drop-shadow-[0_1px_3px_rgba(10,42,99,0.4)]"
            style={{ fontSize: "clamp(8.5px, 1.5vw, 15px)" }}
          >
            Siap menguji kemampuan Anda? Mulai ujian dan pantau perkembangan belajar Anda.
          </p>

          <Link
            href="/ujian-tersedia"
            className="mt-[0.4vw] inline-flex w-fit items-center gap-[0.5em] rounded-full bg-white font-semibold text-[#123a8f] shadow-[0_10px_20px_-6px_rgba(10,42,99,0.55)] transition-all active:scale-[0.98] sm:hover:-translate-y-0.5 sm:hover:shadow-[0_14px_26px_-6px_rgba(10,42,99,0.6)]"
            style={{
              fontSize: "clamp(8.5px, 1.5vw, 14px)",
              padding: "clamp(6px, 1.2vw, 11px) clamp(12px, 2.4vw, 22px)",
            }}
          >
            <IconSend className="h-[1.3em] w-[1.3em]" />
            Mulai Ujian Baru
            <IconChevronRight className="h-[1.3em] w-[1.3em]" />
          </Link>
        </div>
      </div>

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
                <Card
                  key={hasil.id}
                  className="flex flex-col gap-3.5 border-[#f0d9ad] bg-[#fdf6e7] p-4 dark:border-amber-400/30 dark:bg-amber-400/10 sm:flex-row sm:items-center sm:justify-between"
                >
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
                      <p className="text-[13.5px] font-semibold text-[#16233f] dark:text-white">
                        Ujian sedang berlangsung
                      </p>
                      <p className="text-[13px] text-[#8a6a2f] dark:text-amber-300">{hasil.ujian.judul}</p>
                      <p className="mt-0.5 text-[11.5px] text-[#a3854f] dark:text-amber-300/70">
                        Lanjutkan sebelum waktu pengerjaan habis.
                      </p>
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
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#16233f] dark:text-white">
                <IconBook className="h-[18px] w-[18px] text-[#3457c9] dark:text-blue-300" />
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
                  <Card
                    key={ujian.id}
                    className="group relative flex flex-col gap-4 overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_0_#e3e7ee,0_20px_32px_-16px_rgba(22,35,63,0.38)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_0_#0d1424,0_16px_28px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_0_#0d1424,0_22px_34px_-16px_rgba(0,0,0,0.68)]"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                          <Image
                            src={getSubjectIconSrc(ujian.judul)}
                            alt={ujian.judul}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain drop-shadow-[0_3px_5px_rgba(22,35,63,0.22)] transition-transform duration-300 group-hover:-translate-y-0.5"
                          />
                        </span>
                        <p className="mt-1 text-[14px] font-semibold leading-snug text-[#16233f] dark:text-white">
                          {ujian.judul}
                        </p>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Badge tone="slate">{formatDurasi(ujian.durasiMenit)}</Badge>
                        <Badge tone="slate">{ujian.soal.length} soal</Badge>
                      </div>
                    </div>
                    <div className="relative mt-auto flex items-center justify-between gap-2 border-t border-[#efece4] pt-3 dark:border-white/10">
                      <p className="text-[11px] text-[#8b93a6] dark:text-white/40">
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
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#16233f] dark:text-white">
                <IconClock className="h-[18px] w-[18px] text-[#8b93a6] dark:text-white/50" />
                Riwayat Ujian
              </h2>
              {selesai.length > 0 && (
                <Link
                  href="/riwayat"
                  className="text-[12.5px] font-medium text-[#3457c9] hover:underline dark:text-[#8fb1ff]"
                >
                  Lihat Semua
                </Link>
              )}
            </div>

            {selesai.length === 0 ? (
              <EmptyState text="Anda belum menyelesaikan ujian apa pun." />
            ) : (
              <Card className="divide-y divide-[#efece4] overflow-hidden dark:divide-white/10">
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
                      <p className="truncate text-[13.5px] font-medium text-[#16233f] dark:text-white">
                        {hasil.ujian.judul}
                      </p>
                      <p className="text-[12px] text-[#8b93a6] dark:text-white/40">
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
          <CalendarCard
            initialYear={sekarang.getFullYear()}
            initialMonth={sekarang.getMonth()}
            todayKey={kunciHariIni}
            markedDates={markedDates}
          />

          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold text-[#16233f] dark:text-white">
                <IconLightbulb className="h-4 w-4 text-[#e8a33d]" />
                Sorotan Ujian
              </p>
              {tersedia.length > 0 ? (
                <Badge tone="amber">{tersedia.length} tersedia</Badge>
              ) : (
                <Link
                  href="/ujian-tersedia"
                  className="text-[11.5px] font-medium text-[#3457c9] hover:underline dark:text-[#8fb1ff]"
                >
                  Lihat Semua
                </Link>
              )}
            </div>

            {tersedia.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-[#e7e4dc] px-3.5 py-6 text-center dark:border-white/10">
                <Image
                  src="/image/icon/pencarian-icon.png"
                  alt="Tidak ada ujian yang disorot"
                  width={110}
                  height={80}
                  className="h-[76px] w-auto object-contain"
                />
                <p className="text-[12.5px] text-[#8b93a6] dark:text-white/50">
                  Tidak ada ujian yang perlu disorot saat ini.
                </p>
                <p className="text-[11px] text-[#a3aebd] dark:text-white/30">Ujian yang penting akan muncul di sini.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {tersedia.slice(0, 4).map((ujian) => (
                  <Link
                    key={ujian.id}
                    href={`/ujian/${ujian.id}`}
                    className="flex items-center gap-3 rounded-[12px] border border-[#f0d9ad] bg-[#fdf6e7] px-3 py-2.5 transition-colors hover:bg-[#fbeed0] dark:border-amber-400/30 dark:bg-amber-400/10 dark:hover:bg-amber-400/20"
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
                      <p className="truncate text-[12.5px] font-semibold text-[#16233f] dark:text-white">
                        {ujian.judul}
                      </p>
                      <p className="truncate text-[11px] text-[#8a6a2f] dark:text-amber-300/80">
                        Tutup {formatTanggalSingkat(ujian.selesai)}, {formatJam(ujian.selesai)}
                      </p>
                    </div>
                  </Link>
                ))}

                {tersedia.length > 4 && (
                  <p className="pt-0.5 text-center text-[11.5px] text-[#8b93a6] dark:text-white/40">
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
    <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-[#e7e4dc] bg-white/60 px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
      {illustration}
      <p className="text-[13px] font-medium text-[#16233f] dark:text-white">{text}</p>
      {hint && <p className="text-[12px] text-[#8b93a6] dark:text-white/40">{hint}</p>}
    </div>
  )
}