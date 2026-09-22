import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, toneGradients, toneIconShadow } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconArrowLeft, IconX, IconCheckCircle, IconAlertTriangle } from "@/components/ui/Icons"
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

/* =========================================================
   FORMAT & HELPER
========================================================= */

const formatTanggalPanjang = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value)

const formatJam = (value: Date) =>
  `${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(value)} WIB`

function formatDurasi(menit: number) {
  if (menit < 1) return "< 1 menit"
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`
}

/** Warna skor hanya indikator visual relatif — sesuaikan ambang batas sesuai kebutuhan. */
function toneSkor(skor: number | null): "emerald" | "amber" | "red" | "slate" {
  if (skor === null) return "slate"
  if (skor >= 80) return "emerald"
  if (skor >= 60) return "amber"
  return "red"
}

const labelPelanggaran: Record<string, string> = {
  PINDAH_TAB: "Berpindah tab browser",
  KELUAR_FULLSCREEN: "Keluar dari mode layar penuh",
  KEHILANGAN_FOKUS: "Kehilangan fokus jendela",
  COPY_PASTE: "Melakukan copy-paste",
  KLIK_KANAN: "Klik kanan pada halaman",
  DEVTOOLS: "Membuka developer tools",
}

/** Status jawaban per soal — dipetakan ke icon 3D + tone badge/aksen yang konsisten. */
type StatusJawaban = "benar" | "salah" | "belum" | "kosong"

const statusInfo: Record<
  StatusJawaban,
  { src?: string; label: string; tone: "emerald" | "red" | "amber" | "slate"; aksen: string }
> = {
  benar: { src: "/image/icon/jawaban-benar-icon.png", label: "Benar", tone: "emerald", aksen: "#10b981" },
  salah: { src: "/image/icon/jawaban-salah-icon.png", label: "Salah", tone: "red", aksen: "#e0625c" },
  belum: { src: "/image/icon/belum-dinilai-icon.png", label: "Menunggu penilaian", tone: "amber", aksen: "#d9a441" },
  kosong: { label: "Tidak dijawab", tone: "slate", aksen: "#c3c9d6" },
}

function hitungStatus(jawaban: JawabanPeserta | null): StatusJawaban {
  const sudahDijawab = jawaban !== null && (jawaban.opsiPilihan !== null || (jawaban.jawabanTeks?.trim().length ?? 0) > 0)
  if (!sudahDijawab) return "kosong"
  if (jawaban!.benar === true) return "benar"
  if (jawaban!.benar === false) return "salah"
  return "belum"
}

/* =========================================================
   TIPE
========================================================= */

type OpsiSoal = {
  id: string
  teks: string
  urutan: number
}

type SoalUjian = {
  id: string
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  poin: number
  opsi: OpsiSoal[]
}

type JawabanPeserta = {
  jawabanTeks: string | null
  opsiPilihan: string | null
  benar: boolean | null
}

type Params = { params: Promise<{ id: string }> }

/* =========================================================
   HALAMAN
========================================================= */

export default async function HasilDetailPage({ params }: Params) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  const userId = session?.user.id
  if (!userId) return null

  const hasil = await prisma.hasilUjian.findUnique({
    where: { id },
    include: {
      ujian: {
        select: {
          judul: true,
          deskripsi: true,
          soal: {
            orderBy: { urutan: "asc" },
            include: { opsi: { orderBy: { urutan: "asc" }, select: { id: true, teks: true, urutan: true } } },
          },
        },
      },
      jawaban: true,
      logPelanggaran: { orderBy: { waktu: "asc" } },
    },
  })

  if (!hasil || hasil.userId !== userId) notFound()

  // Ujian yang belum diselesaikan seharusnya dilanjutkan, bukan dilihat hasilnya.
  if (hasil.status === "SEDANG_DIKERJAKAN") {
    redirect(`/ujian/${hasil.ujianId}`)
  }

  const jawabanMap = new Map(hasil.jawaban.map((jawaban) => [jawaban.soalId, jawaban]))
  const waktuSelesai = hasil.waktuSelesai ?? hasil.waktuMulai
  const durasiPengerjaan = Math.max(0, Math.round((waktuSelesai.getTime() - hasil.waktuMulai.getTime()) / 60_000))

  const totalSoal = hasil.ujian.soal.length
  const jumlahBenar = hasil.ujian.soal.filter((soal) => jawabanMap.get(soal.id)?.benar === true).length
  const jumlahSalah = hasil.ujian.soal.filter((soal) => jawabanMap.get(soal.id)?.benar === false).length
  const jumlahBelumDinilai = totalSoal - jumlahBenar - jumlahSalah

  const kunciSkor = toneSkor(hasil.skor)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/riwayat"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] hover:text-[#16233f]"
        >
          <IconArrowLeft className="h-4 w-4" />
          Kembali ke riwayat
        </Link>
      </div>

      {/* ==================== RINGKASAN HASIL ==================== */}
      <Card className="relative flex flex-col gap-5 overflow-hidden border-[#e9ecf2] p-6 shadow-[0_6px_0_#eef0f4,0_20px_34px_-18px_rgba(22,35,63,0.3)] dark:border-white/10 dark:shadow-[0_6px_0_#0f1830,0_22px_36px_-18px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
        {/* Highlight glossy tipis di atas card, kesan permukaan 3D */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent dark:from-white/[0.06]"
          aria-hidden="true"
        />

        <div className="relative">
          <p className="text-[12.5px] font-medium text-[#b45309]">{formatTanggalPanjang(waktuSelesai)}</p>
          <div className="mt-1 flex items-center gap-2.5">
            <Image
              src={getSubjectIconSrc(hasil.ujian.judul)}
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_5px_7px_rgba(22,35,63,0.2)] sm:h-10 sm:w-10"
            />
            <h1 className="text-[22px] font-semibold text-[#16233f] dark:text-white">{hasil.ujian.judul}</h1>
          </div>
          {hasil.ujian.deskripsi && (
            <p className="mt-1.5 max-w-xl text-[13px] text-[#5b6a86] dark:text-white/50">{hasil.ujian.deskripsi}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="slate">{totalSoal} soal</Badge>
            <Badge tone="slate">Dikerjakan {formatDurasi(durasiPengerjaan)}</Badge>
            <Badge tone="slate">Selesai {formatJam(waktuSelesai)}</Badge>
            {hasil.jumlahPelanggaran > 0 && <Badge tone="red">{hasil.jumlahPelanggaran} pelanggaran</Badge>}
          </div>
        </div>

        {/* Skor akhir — badge gradient 3D senada dengan tone (emerald/amber/red/slate) */}
        <div
          className={`relative flex shrink-0 flex-col items-center gap-1 rounded-2xl bg-gradient-to-br px-8 py-5 text-white ${toneGradients[kunciSkor]} ${toneIconShadow[kunciSkor]}`}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/75">Skor akhir</p>
          <p className="text-[36px] font-bold leading-none">{hasil.skor !== null ? hasil.skor : "-"}</p>
        </div>
      </Card>

      {/* ==================== RINGKASAN JAWABAN — icon 3D menonjol, tanpa card ==================== */}
      <div className="grid grid-cols-3 gap-3">
        <IkonRingkasan label="Jawaban benar" value={jumlahBenar} iconSrc="/image/icon/jawaban-benar-icon.png" garisWarna="#10b981" />
        <IkonRingkasan label="Jawaban salah" value={jumlahSalah} iconSrc="/image/icon/jawaban-salah-icon.png" garisWarna="#e0625c" />
        <IkonRingkasan label="Belum dinilai" value={jumlahBelumDinilai} iconSrc="/image/icon/belum-dinilai-icon.png" garisWarna="#d9a441" />
      </div>

      {/* ==================== CATATAN PELANGGARAN ==================== */}
      {hasil.logPelanggaran.length > 0 && (
        <Card className="border-[#e9ecf2] p-4 shadow-[0_4px_0_#eef0f4,0_14px_24px_-16px_rgba(22,35,63,0.22)] dark:border-white/10 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fdf1f1] text-[#c53030] dark:bg-white/5 dark:text-[#f29a9a]">
              <IconAlertTriangle className="h-4 w-4" />
            </span>
            <p className="text-[13.5px] font-semibold text-[#16233f] dark:text-white">Catatan Pelanggaran</p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {hasil.logPelanggaran.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 dark:bg-white/[0.04]"
              >
                <span className="text-[12.5px] font-medium text-[#b52f2f] dark:text-[#f29a9a]">
                  {labelPelanggaran[log.tipe] ?? log.tipe}
                </span>
                <span className="text-[11.5px] text-[#8b93a6]">{formatJam(log.waktu)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ==================== PEMBAHASAN PER SOAL ==================== */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#3457c9] dark:bg-white/5 dark:text-[#7fb4e8]">
            <IconCheckCircle className="h-4 w-4" />
          </span>
          <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Pembahasan Soal</h2>
        </div>

        {hasil.ujian.soal.map((soal, index) => (
          <SoalReview key={soal.id} nomor={index + 1} soal={soal} jawaban={jawabanMap.get(soal.id) ?? null} />
        ))}
      </div>
    </div>
  )
}

/* =========================================================
   RINGKASAN JAWABAN — icon 3D besar tanpa card pembungkus
========================================================= */

function IkonRingkasan({
  label,
  value,
  iconSrc,
  garisWarna,
}: {
  label: string
  value: number
  iconSrc: string
  garisWarna: string
}) {
  return (
    <div className="group flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
      <Image
        src={iconSrc}
        alt=""
        width={112}
        height={112}
        className="h-16 w-16 object-contain drop-shadow-[0_12px_18px_rgba(22,35,63,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 sm:h-20 sm:w-20"
      />
      <p className="mt-1 text-[22px] font-semibold leading-none text-[#16233f] dark:text-white sm:text-[27px]">{value}</p>
      <p className="text-[11.5px] font-medium text-[#8b93a6] dark:text-white/50 sm:text-[12.5px]">{label}</p>
      <span
        className="mt-1 block h-[3px] w-9 rounded-full sm:w-11"
        style={{ backgroundColor: garisWarna }}
        aria-hidden="true"
      />
    </div>
  )
}

/* =========================================================
   BADGE STATUS JAWABAN — dengan icon 3D
========================================================= */

function StatusJawabanBadge({ status }: { status: StatusJawaban }) {
  const info = statusInfo[status]

  return (
    <Badge tone={info.tone} className="shrink-0 items-center gap-1.5 py-1 pl-1.5 pr-2.5">
      {info.src ? (
        <Image src={info.src} alt="" width={20} height={20} className="h-4 w-4 object-contain" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {info.label}
    </Badge>
  )
}

/* =========================================================
   PEMBAHASAN SATU SOAL
========================================================= */

function SoalReview({
  nomor,
  soal,
  jawaban,
}: {
  nomor: number
  soal: SoalUjian
  jawaban: JawabanPeserta | null
}) {
  const status = hitungStatus(jawaban)

  return (
    <Card className="group relative overflow-hidden border-[#e9ecf2] p-4 shadow-[0_4px_0_#eef0f4,0_14px_24px_-16px_rgba(22,35,63,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e7eaf1,0_18px_30px_-16px_rgba(22,35,63,0.28)] dark:border-white/10 dark:shadow-[0_4px_0_#0f1830,0_14px_24px_-16px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_6px_0_#0f1830,0_18px_30px_-16px_rgba(0,0,0,0.6)] sm:p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13.5px] font-semibold text-[#16233f] dark:text-white">
            <span className="text-[#8b93a6]">Soal {nomor}.</span> {soal.pertanyaan}
          </p>
          <StatusJawabanBadge status={status} />
        </div>

        {soal.tipe === "PILIHAN_GANDA" ? (
          <div className="mt-3 flex flex-col gap-2">
            {soal.opsi.map((opsi) => {
              const dipilih = jawaban?.opsiPilihan === opsi.id
              const benar = dipilih && jawaban?.benar === true
              const salah = dipilih && jawaban?.benar === false

              return (
                <div
                  key={opsi.id}
                  className={`flex items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[12.5px] transition-colors ${
                    benar
                      ? "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]"
                      : salah
                        ? "border-[#f5cccc] bg-[#fdf1f1] text-[#d23b3b]"
                        : "border-[#e7e4dc] bg-white text-[#34435f] dark:border-white/10 dark:bg-white/[0.02] dark:text-white/70"
                  }`}
                >
                  {benar ? (
                    <IconCheckCircle className="h-4 w-4 shrink-0" />
                  ) : salah ? (
                    <IconX className="h-4 w-4 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border border-[#d5d9e0]" />
                  )}
                  <span className="flex-1">{opsi.teks}</span>
                  {dipilih && <span className="shrink-0 text-[10.5px] font-medium opacity-70">Jawaban Anda</span>}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-[10px] border border-[#e7e4dc] bg-[#fbfaf7] px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#8b93a6]">Jawaban Anda</p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] text-[#34435f] dark:text-white/70">
              {jawaban?.jawabanTeks?.trim() ? jawaban.jawabanTeks : "Tidak dijawab"}
            </p>
          </div>
        )}

        <p className="mt-3 text-[11.5px] text-[#8b93a6]">{soal.poin} poin</p>
      </div>
    </Card>
  )
}