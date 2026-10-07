import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconBook, IconChevronRight } from "@/components/ui/Icons"
import { getSubjectIconSrc } from "@/lib/subject-icons"

type SkorTone = "emerald" | "amber" | "red" | "slate"

const KUNCI_LAINNYA = "__lainnya"
const LABEL_LAINNYA = "Lainnya"

/* ---------- gaya 3D yang dipakai ulang ---------- */

const PERMUKAAN_3D =
  "bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] " +
  "dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)]"

const PERMUKAAN_3D_HOVER =
  "transition-all duration-300 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] " +
  "dark:group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_7px_0_#0d1424,0_24px_36px_-16px_rgba(0,0,0,0.68)]"

const TOMBOL_UTAMA =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#5b52e0] to-[#4338ca] font-semibold text-white " +
  "shadow-[0_3px_0_#312e81,0_8px_14px_-6px_rgba(49,46,129,0.55)] transition-all hover:brightness-110 " +
  "active:translate-y-[2px] active:shadow-[0_1px_0_#312e81]"

const TOMBOL_SEKUNDER =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e3e6ee] bg-gradient-to-b from-white to-[#f3f4f8] font-semibold text-[#3b4663] " +
  "shadow-[0_3px_0_#dfe3ec,0_8px_14px_-8px_rgba(22,35,63,0.25)] transition-all hover:brightness-[0.98] " +
  "active:translate-y-[2px] active:shadow-[0_1px_0_#dfe3ec] " +
  "dark:border-white/10 dark:from-white/10 dark:to-white/5 dark:text-white/80 dark:shadow-[0_3px_0_#0d1424]"

const TOMBOL_NONAKTIF =
  "inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#edf0ef] font-semibold text-[#a0a8ba] dark:bg-white/10 dark:text-white/30"

const TONE_SKOR: Record<SkorTone, { bar: string; angka: string; label: string }> = {
  emerald: {
    bar: "from-[#34d399] to-[#047857]",
    angka: "text-[#047857] dark:text-[#6ee7b7]",
    label: "Sangat baik",
  },
  amber: {
    bar: "from-[#fbbf24] to-[#b8863b]",
    angka: "text-[#b8863b] dark:text-[#fcd34d]",
    label: "Cukup",
  },
  red: {
    bar: "from-[#f87171] to-[#b52f2f]",
    angka: "text-[#b52f2f] dark:text-[#fca5a5]",
    label: "Perlu perhatian",
  },
  slate: {
    bar: "from-[#94a3b8] to-[#475569]",
    angka: "text-[#475569] dark:text-white/60",
    label: "Belum ada nilai",
  },
}

/* ---------- helper ---------- */

function toneSkor(skor: number | null): SkorTone {
  if (skor === null) return "slate"
  if (skor >= 80) return "emerald"
  if (skor >= 60) return "amber"
  return "red"
}

function rataList(list: number[]) {
  return list.length ? Math.round((list.reduce((s, v) => s + v, 0) / list.length) * 10) / 10 : null
}

function urlUnduhMapel(kunci?: string) {
  return kunci
    ? `/api/hasil-guru-mapel/unduh?mapel=${encodeURIComponent(kunci)}`
    : "/api/hasil-guru-mapel/unduh"
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

/* ---------- halaman ---------- */

export default async function HasilGuruPage() {
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findMany({
    where: { pembuatId: guru.user.id },
    orderBy: { mulai: "desc" },
    include: { hasilUjian: { select: { skor: true, status: true } } },
  })

  const ringkasan = ujian.map((u) => {
    const selesai = u.hasilUjian.filter((h) => h.status === "SELESAI" && h.skor !== null)
    const rataRata = rataList(selesai.map((h) => h.skor as number))
    return { ujian: u, peserta: u.hasilUjian.length, selesai: selesai.length, rataRata }
  })

  const totalPeserta = ringkasan.reduce((s, r) => s + r.peserta, 0)
  const totalSelesai = ringkasan.reduce((s, r) => s + r.selesai, 0)
  const semuaSkorSelesai = ringkasan.flatMap((r) =>
    r.ujian.hasilUjian
      .filter((h) => h.status === "SELESAI" && h.skor !== null)
      .map((h) => h.skor as number)
  )
  const rataRataKeseluruhan = rataList(semuaSkorSelesai)
  const persentaseSelesaiKeseluruhan =
    totalPeserta > 0 ? Math.round((totalSelesai / totalPeserta) * 100) : 0

  // Kelompokkan per mata pelajaran TANPA membedakan huruf besar/kecil
  // ("B. Inggris" dan "B. INGGRIS" jadi satu grup). Abjad, "Lainnya" di akhir.
  type Ringkas = (typeof ringkasan)[number]
  const peta = new Map<string, { label: string; items: Ringkas[] }>()
  for (const r of ringkasan) {
    const nama = (r.ujian.mataPelajaran ?? "").trim()
    const kunci = nama ? nama.toLowerCase() : KUNCI_LAINNYA
    const ada = peta.get(kunci)
    if (ada) ada.items.push(r)
    else peta.set(kunci, { label: nama || LABEL_LAINNYA, items: [r] })
  }

  const kelompokMapel = [...peta.entries()]
    .sort(([a], [b]) => {
      if (a === KUNCI_LAINNYA) return 1
      if (b === KUNCI_LAINNYA) return -1
      return a.localeCompare(b, "id")
    })
    .map(([kunci, { label, items }]) => ({
      kunci,
      label,
      // nilai yang dikirim ke API unduh
      kunciUnduh: kunci === KUNCI_LAINNYA ? KUNCI_LAINNYA : label,
      items,
      peserta: items.reduce((s, r) => s + r.peserta, 0),
      rataRata: rataList(
        items.flatMap((r) =>
          r.ujian.hasilUjian
            .filter((h) => h.status === "SELESAI" && h.skor !== null)
            .map((h) => h.skor as number)
        )
      ),
    }))

  return (
    <div className="space-y-7">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#5b52e0] via-[#4338ca] to-[#2f2a8f] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_0_#262470,0_26px_40px_-18px_rgba(49,46,129,0.65)] sm:p-7">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#818cf8]/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Portal Guru
            </p>
            <h1 className="mt-1 text-[22px] font-bold leading-tight sm:text-[28px]">Hasil & Nilai</h1>
            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-white/75 sm:text-[13px]">
              Ringkasan performa seluruh ujian yang Anda buat. Unduh rekap nilai per ujian atau per
              mata pelajaran dalam satu klik.
            </p>

            <div className="mt-3.5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
                {kelompokMapel.length} mata pelajaran
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
                {ujian.length} ujian
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
                {totalPeserta} peserta
              </span>
            </div>
          </div>

          {totalPeserta > 0 && (
            <a
              href={urlUnduhMapel()}
              download
              title="Unduh nilai semua mata pelajaran (.xlsx)"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-[#eceefe] px-5 text-[12.5px] font-semibold text-[#3730a3] shadow-[0_4px_0_#c7caf0,0_12px_20px_-8px_rgba(15,10,70,0.55)] transition-all hover:brightness-[0.98] active:translate-y-[2px] active:shadow-[0_2px_0_#c7caf0]"
            >
              <IconDownload className="h-4 w-4" />
              Unduh Semua Mapel (Excel)
            </a>
          )}
        </div>
      </section>

      {/* ================= RINGKASAN ================= */}
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard
          iconImageSrc="/image/icon/total-ujian-icon.png"
          label="Total Ujian"
          value={ujian.length}
          tone="indigo"
        />
        <StatCard
          iconImageSrc="/image/icon/total-peserta-icon.png"
          label="Total Peserta"
          value={totalPeserta}
          tone="blue"
        />
        <StatCard
          iconImageSrc="/image/icon/selesai-icon.png"
          label="Selesai Dikerjakan"
          value={totalSelesai}
          description={totalPeserta > 0 ? `${persentaseSelesaiKeseluruhan}% dari peserta` : undefined}
          tone="emerald"
        />
        <StatCard
          iconImageSrc="/image/icon/rata-rata-score.png"
          label="Rata-rata Keseluruhan"
          value={rataRataKeseluruhan ?? "—"}
          tone="violet"
        />
      </section>

      {/* ================= DAFTAR ================= */}
      <div className="flex items-center gap-2.5">
        <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">
          Daftar Ujian per Mata Pelajaran
        </h2>
        {ujian.length > 0 && <Badge tone="slate">{ujian.length} ujian</Badge>}
      </div>

      {ujian.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-[#8b93a6] dark:bg-white/5 dark:text-white/40">
            <IconBook className="h-5 w-5" />
          </span>
          <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">
            Anda belum memiliki ujian.
          </p>
        </Card>
      ) : (
        <div className="space-y-9">
          {kelompokMapel.map((grup) => (
            <section key={grup.kunci} className="space-y-4">
              {/* ---------- Panel mata pelajaran ---------- */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#e7e4dc] px-4 py-3 dark:border-white/10 ${PERMUKAAN_3D}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={getSubjectIconSrc(grup.label)}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_3px_5px_rgba(22,35,63,0.22)]"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-[#16233f] dark:text-white">
                      {grup.label}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge tone="slate">{grup.items.length} ujian</Badge>
                      <Badge tone="slate">{grup.peserta} peserta</Badge>
                      <Badge tone={toneSkor(grup.rataRata)}>
                        {grup.rataRata !== null ? `Rata-rata ${grup.rataRata}` : "Belum ada nilai"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {grup.peserta > 0 ? (
                  <a
                    href={urlUnduhMapel(grup.kunciUnduh)}
                    download
                    title={`Unduh semua nilai ${grup.label} (.xlsx)`}
                    className={`${TOMBOL_UTAMA} h-9 px-4 text-[12px]`}
                  >
                    <IconDownload className="h-4 w-4" />
                    Unduh Semua Nilai Mapel
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    title="Belum ada peserta"
                    className={`${TOMBOL_NONAKTIF} h-9 px-4 text-[12px]`}
                  >
                    <IconDownload className="h-4 w-4" />
                    Unduh Semua Nilai Mapel
                  </span>
                )}
              </div>

              {/* ---------- Kartu ujian ---------- */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {grup.items.map(({ ujian: u, peserta, selesai, rataRata }) => {
                  const persentaseSelesai = peserta > 0 ? Math.round((selesai / peserta) * 100) : 0
                  const bisaUnduh = peserta > 0
                  const tone = toneSkor(rataRata)
                  const gaya = TONE_SKOR[tone]

                  return (
                    <div
                      key={u.id}
                      className="group relative transition-transform duration-300 hover:-translate-y-1"
                    >
                      <Card
                        className={`relative flex h-full flex-col gap-4 overflow-hidden p-4 ${PERMUKAAN_3D} ${PERMUKAAN_3D_HOVER}`}
                      >
                        <span
                          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
                          aria-hidden="true"
                        />
                        <span
                          className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]"
                          aria-hidden="true"
                        />

                        {/* Header kartu */}
                        <div className="relative flex items-start gap-3">
                          <Image
                            src={getSubjectIconSrc(u.judul)}
                            alt=""
                            width={44}
                            height={44}
                            className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_4px_6px_rgba(22,35,63,0.25)] transition-transform duration-300 group-hover:-translate-y-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/hasil-guru/${u.id}`}
                              className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#16233f] transition-colors hover:text-[#4338ca] dark:text-white dark:hover:text-[#a5b4fc]"
                            >
                              {u.judul}
                            </Link>
                            <p className="mt-0.5 text-[11px] text-[#8b93a6] dark:text-white/40">
                              {gaya.label}
                            </p>
                          </div>

                          {/* Nilai rata-rata menonjol */}
                          <div className="shrink-0 text-right">
                            <p className={`text-[22px] font-bold leading-none ${gaya.angka}`}>
                              {rataRata ?? "—"}
                            </p>
                            <p className="mt-1 text-[10px] leading-none text-[#8b93a6] dark:text-white/40">
                              Rata-rata
                            </p>
                          </div>
                        </div>

                        {/* Statistik dalam baki cekung */}
                        <div className="relative grid grid-cols-3 divide-x divide-[#e3e6ee] rounded-[14px] bg-[#f1f3f8]/80 py-3 shadow-[inset_0_2px_4px_rgba(22,35,63,0.07)] dark:divide-white/10 dark:bg-black/20 dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                          {[
                            { src: "/image/icon/peserta-icon.png", nilai: peserta, label: "Peserta" },
                            { src: "/image/icon/selesai.png", nilai: selesai, label: "Selesai" },
                            { src: "/image/icon/persen.png", nilai: `${persentaseSelesai}%`, label: "Progres" },
                          ].map((s) => (
                            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                              <Image
                                src={s.src}
                                alt=""
                                width={36}
                                height={36}
                                className="h-9 w-9 object-contain drop-shadow-[0_5px_8px_rgba(49,46,129,0.22)]"
                              />
                              <p className="text-[14px] font-semibold leading-none text-[#16233f] dark:text-white">
                                {s.nilai}
                              </p>
                              <p className="text-[10px] leading-none text-[#8b93a6] dark:text-white/40">
                                {s.label}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div className="relative">
                          <div className="flex items-center justify-between text-[10.5px] text-[#8b93a6] dark:text-white/40">
                            <span>Progres pengerjaan</span>
                            <span className="font-medium text-[#5b657d] dark:text-white/60">
                              {selesai}/{peserta} selesai
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e6e9f0] shadow-[inset_0_1px_2px_rgba(22,35,63,0.12)] dark:bg-white/10">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${gaya.bar}`}
                              style={{ width: `${persentaseSelesai}%` }}
                            />
                          </div>
                        </div>

                        {/* Aksi */}
                        <div className="relative mt-auto grid grid-cols-[auto_1fr] gap-2.5">
                          <Link
                            href={`/hasil-guru/${u.id}`}
                            className={`${TOMBOL_SEKUNDER} h-9 px-3.5 text-[12px]`}
                          >
                            Detail
                            <IconChevronRight className="h-3.5 w-3.5" />
                          </Link>

                          {bisaUnduh ? (
                            <a
                              href={`/api/hasil-guru/${u.id}/unduh`}
                              download
                              title={`Unduh nilai ${u.judul} (.xlsx)`}
                              className={`${TOMBOL_UTAMA} h-9 text-[12px]`}
                            >
                              <IconDownload className="h-4 w-4" />
                              Unduh Nilai (Excel)
                            </a>
                          ) : (
                            <span
                              aria-disabled="true"
                              title="Belum ada peserta"
                              className={`${TOMBOL_NONAKTIF} h-9 text-[12px]`}
                            >
                              <IconDownload className="h-4 w-4" />
                              Unduh Nilai (Excel)
                            </span>
                          )}
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}