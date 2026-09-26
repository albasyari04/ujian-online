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
import { IconChevronRight, IconSend } from "@/components/ui/Icons"

export const dynamic = "force-dynamic"

/* =========================================================
   ICON LOKAL
   Icon-icon di bawah ini ditulis inline agar bisa dipakai
   langsung di Server Component tanpa perlu import dari
   components/ui/Icons (yang mungkin hanya tersedia untuk
   client component).
========================================================= */

/** Ikon buku terbuka — pengganti ikon "Ujian Tersedia".
 *  Mengikuti gaya ujian-tersedia-icon.png (buku terbuka polos). */
function IconBukaBuku({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 6.5C10.4 5 8.1 4.3 5.5 4.5C4.7 4.6 4 5.2 4 6.1V17.5C4 18.4 4.8 19 5.7 18.9C8.1 18.7 10.3 19.4 12 20.7C13.7 19.4 15.9 18.7 18.3 18.9C19.2 19 20 18.4 20 17.5V6.1C20 5.2 19.3 4.6 18.5 4.5C15.9 4.3 13.6 5 12 6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 6.5V20.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

/** Ikon kalender bergaya jadwal-icon.png — pengganti ikon jam
 *  pada heading "Riwayat Ujian". Didesain agar kontras di mode gelap. */
function IconKalender({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.5V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 3.5V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.3" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="15.7" cy="14" r="1" fill="currentColor" />
    </svg>
  )
}

/** Ikon kamera video bergaya sorotan-icon.png — pengganti ikon
 *  bola lampu pada heading "Sorotan Ujian". */
function IconVideo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="6.5" width="12.5" height="11" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M15.5 10.5L20.3 8.1C20.9 7.8 21.5 8.2 21.5 8.8V15.2C21.5 15.8 20.9 16.2 20.3 15.9L15.5 13.5V10.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
  const rataRata =
    selesai.length > 0
      ? selesai.reduce((total, hasil) => total + (hasil.skor ?? 0), 0) / selesai.length
      : null

  // Nama lengkap peserta sesuai akun yang login.
  const namaLengkap = (session.user.name ?? "Peserta").trim() || "Peserta"

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
      <div
        className="relative w-full overflow-hidden rounded-[18px] min-h-[108px]"
        style={{ aspectRatio: "1769 / 592" }}
      >
        <Image
          src="/image/banner/peserta-beranda.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Blok teks sambutan — kiri-atas banner, mengikuti tata letak
            "Welcome Back, Aryan Sharma!" pada gambar desain. */}
        <div
          className="absolute z-10 flex flex-col"
          style={{
            left: "4vw",
            top: "20%",
            width: "44vw",
          }}
        >
          <h1 className="leading-[1.1] text-white drop-shadow-[0_2px_6px_rgba(10,42,99,0.55)]">
            <span
              className="block font-medium"
              style={{ fontSize: "clamp(10px, 1.6vw, 20px)" }}
            >
              Selamat datang, <span aria-hidden="true">👋</span>
            </span>

            <span
              className="mt-[0.3vw] block font-extrabold text-white"
              style={{
                fontSize: "clamp(18px, 3.4vw, 44px)",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                textShadow: "0 3px 10px rgba(10,42,99,0.6)",
              }}
            >
              {namaLengkap}!
            </span>
          </h1>

          <p
            className="mt-[1vw] font-normal text-white/95"
            style={{
              fontSize: "clamp(9px, 1.35vw, 17px)",
              lineHeight: 1.35,
              textShadow: "0 1px 4px rgba(10,42,99,0.5)",
            }}
          >
            Ready to test your knowledge?
            <br />
            Start your exam and track your performance.
          </p>
        </div>

        {/* Tombol — digeser lebih ke bawah supaya tidak mepet dengan
            deskripsi, dan ukuran font/padding diperkecil sedikit. */}
        <Link
          href="/ujian-tersedia"
          className="absolute z-10 inline-flex items-center gap-[0.55em] rounded-full bg-white font-bold text-[#123a8f] shadow-[0_10px_22px_-6px_rgba(10,42,99,0.55)] transition-all active:scale-[0.98] sm:hover:-translate-y-0.5 sm:hover:shadow-[0_14px_28px_-6px_rgba(10,42,99,0.65)]"
          style={{
            left: "4vw",
            top: "78%",
            fontSize: "clamp(8px, 1.2vw, 14px)",
            padding: "clamp(5px, 0.85vw, 10px) clamp(12px, 1.7vw, 20px)",
          }}
        >
          <IconSend className="h-[1.15em] w-[1.15em]" />
          Mulai Ujian Baru
          <IconChevronRight className="h-[1.15em] w-[1.15em]" />
        </Link>
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
                {/* Icon diganti: buku terbuka — warna kontras di light & dark */}
                <IconBukaBuku className="h-[18px] w-[18px] text-[#3457c9] dark:text-blue-300" />
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
                {/* Icon diganti: kalender — warna kontras di light & dark */}
                <IconKalender className="h-[18px] w-[18px] text-[#8b93a6] dark:text-white/70" />
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
                {/* Icon diganti: kamera video — warna amber kontras di light & dark */}
                <IconVideo className="h-4 w-4 text-[#e8a33d] dark:text-amber-300" />
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
                <p className="text-[11px] text-[#a3aebd] dark:text-white/30">
                  Ujian yang penting akan muncul di sini.
                </p>
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