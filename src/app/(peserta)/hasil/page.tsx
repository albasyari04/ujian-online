import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, RingkasanCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
// NOTE: sesuaikan path import ini dengan lokasi file subject-icons.ts di proyek Anda
// (mis. "@/lib/subject-icons" atau "@/utils/subject-icons").
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

/* =========================================================
   IKON LOKAL
   IconHasil belum ada di components/ui/Icons.tsx (sebelumnya hanya
   didefinisikan lokal di SidebarPeserta.tsx).
========================================================= */

function IconHasil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4.5 20V4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.5 20H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7.5" y="13" width="3" height="7" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12.7" y="9.5" width="3" height="10.5" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="17.9" y="6" width="2.6" height="14" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/* =========================================================
   FORMAT & HELPER
========================================================= */

const formatTanggalSingkat = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(value)

/** Warna badge skor hanya indikator visual relatif — sesuaikan ambang batas sesuai kebutuhan. */
function toneSkor(skor: number | null): "emerald" | "amber" | "red" | "slate" {
  if (skor === null) return "slate"
  if (skor >= 80) return "emerald"
  if (skor >= 60) return "amber"
  return "red"
}

/* =========================================================
   TIPE
========================================================= */

type UrutanHasil = "nilai" | "terbaru"

type ItemHasil = {
  hasilId: string
  judul: string
  totalSoal: number
  skor: number | null
  waktuSelesai: Date
}

/* =========================================================
   HALAMAN
========================================================= */

export default async function HasilNilaiPage({
  searchParams,
}: {
  searchParams: Promise<{ urut?: string }>
}) {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const { urut } = await searchParams
  const urutan: UrutanHasil = urut === "terbaru" ? "terbaru" : "nilai"

  const hasilSelesai = await prisma.hasilUjian.findMany({
    where: { userId, status: "SELESAI" },
    include: {
      ujian: { select: { judul: true, soal: { select: { id: true } } } },
    },
    orderBy: urutan === "nilai" ? [{ skor: "desc" }, { waktuSelesai: "desc" }] : { waktuSelesai: "desc" },
  })

  const daftar: ItemHasil[] = hasilSelesai.map((hasil) => ({
    hasilId: hasil.id,
    judul: hasil.ujian.judul,
    totalSoal: hasil.ujian.soal.length,
    skor: hasil.skor,
    waktuSelesai: hasil.waktuSelesai ?? hasil.waktuMulai,
  }))

  const skorValid = daftar.map((item) => item.skor).filter((skor): skor is number => skor !== null)
  const nilaiTertinggi = skorValid.length > 0 ? Math.max(...skorValid) : null
  const nilaiTerendah = skorValid.length > 0 ? Math.min(...skorValid) : null
  const rataRata = skorValid.length > 0 ? skorValid.reduce((total, skor) => total + skor, 0) / skorValid.length : null

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12.5px] font-medium text-[#b45309]">Rekap penilaian</p>
          <h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Hasil &amp; Nilai</h1>
          <p className="mt-1 text-[13px] text-[#5b6a86]">
            Ringkasan skor dari setiap ujian yang telah Anda selesaikan.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start rounded-[12px] border border-[#e7e4dc] bg-white p-1">
          <UrutanTab label="Nilai tertinggi" aktif={urutan === "nilai"} href="/hasil?urut=nilai" />
          <UrutanTab label="Terbaru" aktif={urutan === "terbaru"} href="/hasil?urut=terbaru" />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <RingkasanCard
          label="Nilai tertinggi"
          value={nilaiTertinggi !== null ? nilaiTertinggi.toFixed(1) : "-"}
          tone="emerald"
          iconImageSrc="/image/icon/nilai-tertinggi-icon.png"
          icon={null}
        />
        <RingkasanCard
          label="Rata-rata nilai"
          value={rataRata !== null ? rataRata.toFixed(1) : "-"}
          tone="blue"
          iconImageSrc="/image/icon/rata-rata-score.png"
          icon={null}
        />
        <RingkasanCard
          label="Nilai terendah"
          value={nilaiTerendah !== null ? nilaiTerendah.toFixed(1) : "-"}
          tone="red"
          iconImageSrc="/image/icon/nilai-terendah-icon.png"
          icon={null}
        />
      </div>

      {daftar.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-[#5b657d]">
            <IconHasil className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[14.5px] font-semibold text-[#16233f]">Belum ada nilai untuk ditampilkan</p>
            <p className="mt-1 max-w-sm text-[13px] text-[#8b93a6]">
              Nilai akan muncul di sini setelah Anda menyelesaikan sebuah ujian.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {daftar.map((item, index) => (
            <ItemHasilCard key={item.hasilId} item={item} peringkat={urutan === "nilai" ? index + 1 : null} />
          ))}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   TAB URUTAN
========================================================= */

function UrutanTab({ label, aktif, href }: { label: string; aktif: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-[9px] px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
        aktif ? "bg-[#16233f] text-white" : "text-[#5b657d] hover:bg-[#f0f2f1]"
      }`}
    >
      {label}
    </Link>
  )
}

/* =========================================================
   KARTU HASIL
========================================================= */

function ItemHasilCard({ item, peringkat }: { item: ItemHasil; peringkat: number | null }) {
  return (
    <Card className="flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <Image
            src={getSubjectIconSrc(item.judul)}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 object-contain drop-shadow-[0_3px_5px_rgba(22,35,63,0.22)]"
          />
          {peringkat !== null && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#b45309] text-[9.5px] font-bold text-white dark:border-[#141c30]">
              {peringkat}
            </span>
          )}
        </span>

        <div>
          <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">{item.judul}</p>
          <p className="mt-1 text-[12px] text-[#8b93a6] dark:text-white/40">
            {formatTanggalSingkat(item.waktuSelesai)} · {item.totalSoal} soal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge tone={toneSkor(item.skor)} className="text-[13px]">
          {item.skor !== null ? `Skor ${item.skor}` : "Menunggu penilaian"}
        </Badge>
        <Link href={`/hasil/${item.hasilId}`} className="shrink-0">
          <Button variant="outline" size="sm">
            Lihat detail
          </Button>
        </Link>
      </div>
    </Card>
  )
}