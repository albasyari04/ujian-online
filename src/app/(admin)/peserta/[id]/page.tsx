"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { FormPeserta } from "@/components/admin/FormPeserta"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, StatCard } from "@/components/ui/Card"
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMail,
  IconPencil,
  IconSpinner,
  IconTrash,
} from "@/components/ui/Icons"
import { ConfirmModal, Modal } from "@/components/ui/Modal"

type HasilUjianItem = {
  id: string
  skor: number | null
  status: "SEDANG_DIKERJAKAN" | "SELESAI"
  waktuMulai: string
  waktuSelesai: string | null
  jumlahPelanggaran: number
  ujian: { id: string; judul: string; durasiMenit: number }
}

type PesertaDetail = {
  id: string
  nama: string
  email: string
  nisn: string | null
  noUrut: number | null
  createdAt: string
  hasilUjian: HasilUjianItem[]
}

const formatterTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const formatterWaktu = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

export default function PesertaDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [peserta, setPeserta] = useState<PesertaDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // ===== Rel scroll manual untuk tabel =====
  // ::-webkit-scrollbar tidak bisa dikustom/ditampilkan permanen di Safari &
  // Chrome iOS, jadi rel-nya dibuat sendiri: track + thumb yang posisinya
  // mengikuti scrollLeft tabel, dan bisa di-drag untuk ikut menggeser tabel.
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [scrollThumb, setScrollThumb] = useState({ widthPct: 100, leftPct: 0, visible: false })

  const updateScrollThumb = useCallback(() => {
    const el = tableScrollRef.current
    if (!el) return

    const { scrollWidth, clientWidth, scrollLeft } = el

    if (scrollWidth <= clientWidth + 1) {
      setScrollThumb({ widthPct: 100, leftPct: 0, visible: false })
      return
    }

    const widthPct = (clientWidth / scrollWidth) * 100
    const maxScrollLeft = scrollWidth - clientWidth
    const leftPct = (scrollLeft / maxScrollLeft) * (100 - widthPct)

    setScrollThumb({ widthPct, leftPct, visible: true })
  }, [])

  function handleThumbPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const trackEl = event.currentTarget.parentElement
    const scrollEl = tableScrollRef.current
    if (!trackEl || !scrollEl) return

    event.preventDefault()

    const trackWidth = trackEl.getBoundingClientRect().width
    const startX = event.clientX
    const startScrollLeft = scrollEl.scrollLeft
    const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaRatio = (moveEvent.clientX - startX) / trackWidth
      const nextScrollLeft = startScrollLeft + deltaRatio * scrollEl!.scrollWidth
      scrollEl!.scrollLeft = Math.max(0, Math.min(maxScrollLeft, nextScrollLeft))
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  const fetchDetail = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(`/api/peserta/${params.id}`)
      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.message ?? "Gagal memuat data peserta.")
        return
      }

      setPeserta(result.peserta)
    } catch {
      setErrorMessage("Gagal terhubung ke server. Periksa koneksi Anda.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchDetail()
    }, 0)

    return () => clearTimeout(timeout)
  }, [fetchDetail])

  useEffect(() => {
    updateScrollThumb()
    window.addEventListener("resize", updateScrollThumb)
    return () => window.removeEventListener("resize", updateScrollThumb)
  }, [updateScrollThumb, peserta])

  async function handleDelete() {
    setIsDeleting(true)
    setDeleteError("")

    try {
      const response = await fetch(`/api/peserta/${params.id}`, { method: "DELETE" })
      const result = await response.json()

      if (!response.ok) {
        setDeleteError(result.message ?? "Gagal menghapus peserta.")
        return
      }

      router.push("/peserta")
    } catch {
      setDeleteError("Gagal terhubung ke server. Periksa koneksi Anda.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <IconSpinner className="h-6 w-6 animate-spin text-[#059669]" />
        <p className="text-[13px] text-[#8b93a6]">Memuat data peserta...</p>
      </Card>
    )
  }

  if (errorMessage || !peserta) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <IconAlertTriangle className="h-8 w-8 text-[#d23b3b]" />
        <p className="text-[13px] text-[#5b657d]">{errorMessage || "Peserta tidak ditemukan."}</p>
        <Link href="/peserta">
          <Button variant="outline" size="sm">
            Kembali ke daftar peserta
          </Button>
        </Link>
      </Card>
    )
  }

  const ujianSelesai = peserta.hasilUjian.filter((item) => item.status === "SELESAI")
  const rataRataSkor =
    ujianSelesai.length > 0
      ? ujianSelesai.reduce((total, item) => total + (item.skor ?? 0), 0) / ujianSelesai.length
      : null
  const totalPelanggaran = peserta.hasilUjian.reduce(
    (total, item) => total + item.jumlahPelanggaran,
    0
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Tautan kembali */}
      <Link
        href="/peserta"
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] transition-colors hover:text-[#059669]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke Kelola Peserta
      </Link>

      {/* Kartu profil peserta */}
      <Card className="relative overflow-hidden border-[#dff3ea] p-6 shadow-[0_10px_24px_-18px_rgba(5,150,105,0.45),0_4px_0_#eefaf4]">
        <span className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-[80px] bg-gradient-to-bl from-[#d7f7e8] to-transparent opacity-80" />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center">
              <Image
                src="/image/icon/user-icon.png"
                alt={peserta.nama}
                width={64}
                height={64}
                className="h-16 w-16 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)]"
              />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#007fc4]">Profil Peserta</p>
              <h1 className="mt-1 truncate text-[22px] font-semibold text-[#16233f]">{peserta.nama}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="flex items-center gap-1.5 text-[12.5px] text-[#5b657d]">
                  <IconMail className="h-3.5 w-3.5" />
                  {peserta.email}
                </p>
                {peserta.nisn && (
                  <p className="flex items-center gap-1.5 text-[12.5px] text-[#5b657d]">
                    <span className="font-semibold text-[#8b93a6]">NISN:</span>
                    <span className="font-mono">{peserta.nisn}</span>
                  </p>
                )}
                {peserta.noUrut !== null && (
                  <p className="flex items-center gap-1.5 text-[12.5px] text-[#5b657d]">
                    <span className="font-semibold text-[#8b93a6]">No. Urut:</span>
                    <span>{peserta.noUrut}</span>
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-[12px] text-[#8b93a6]">
                  <IconCalendar className="h-3.5 w-3.5" />
                  Terdaftar {formatterTanggal.format(new Date(peserta.createdAt))}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <IconPencil className="h-4 w-4" />
              Ubah
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)}>
              <IconTrash className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </div>
      </Card>

      {/* Ringkasan statistik */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard
          label="Ujian Diikuti"
          value={peserta.hasilUjian.length}
          iconImageSrc="/image/icon/ujian-diikuti.png"
          tone="emerald"
        />
        <StatCard
          label="Rata-rata Skor"
          value={rataRataSkor !== null ? rataRataSkor.toFixed(1) : "–"}
          iconImageSrc="/image/icon/rata-rata-score.png"
          tone="blue"
        />
        <StatCard
          label="Total Pelanggaran"
          value={totalPelanggaran}
          iconImageSrc="/image/icon/total-pelanggaran.png"
          tone="amber"
        />
      </div>

      {/* Riwayat ujian */}
      <Card className="overflow-hidden border-[#e9ecf2] shadow-[0_10px_24px_-18px_rgba(22,35,63,0.28),0_4px_0_#f3f5f8]">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf0ef] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#059669]">Aktivitas</p>
            <h2 className="mt-1 text-[15px] font-semibold text-[#16233f]">Riwayat Ujian</h2>
            <p className="mt-0.5 text-[12px] text-[#8b93a6]">
              Daftar ujian yang pernah diikuti peserta ini.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#bfe8d3] bg-[#eafaf2] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
            {peserta.hasilUjian.length} ujian
          </span>
        </div>

        {peserta.hasilUjian.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#059669]">
              <IconClock className="h-5 w-5" />
            </span>
            <p className="text-[13px] text-[#5b657d]">Peserta ini belum mengikuti ujian apa pun.</p>
          </div>
        ) : (
          <>
            <div ref={tableScrollRef} onScroll={updateScrollThumb} className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#edf0ef] bg-[#f7f9f8]">
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Ujian
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Skor
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Waktu Mulai
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Pelanggaran
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {peserta.hasilUjian.map((hasil) => (
                    <tr
                      key={hasil.id}
                      className="border-b border-[#f0f2f1] last:border-0 transition-colors hover:bg-[#f7f9f8]"
                    >
                      <td className="px-5 py-3.5 text-[13px] font-medium text-[#16233f]">
                        {hasil.ujian.judul}
                      </td>
                      <td className="px-5 py-3.5">
                        {hasil.status === "SELESAI" ? (
                          <Badge tone="emerald">Selesai</Badge>
                        ) : (
                          <Badge tone="amber">Sedang dikerjakan</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] font-medium text-[#5b657d]">
                        {hasil.skor !== null ? hasil.skor.toFixed(1) : "–"}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#5b657d]">
                        {formatterWaktu.format(new Date(hasil.waktuMulai))}
                      </td>
                      <td className="px-5 py-3.5">
                        {hasil.jumlahPelanggaran > 0 ? (
                          <Badge tone="red">{hasil.jumlahPelanggaran}x</Badge>
                        ) : (
                          <span className="text-[12.5px] text-[#8b93a6]">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rel scroll horizontal — hanya tampil kalau tabel memang lebih
                lebar dari layar. Dibuat manual karena scrollbar native tidak
                bisa dikustom/ditampilkan permanen di Safari & Chrome iOS. */}
            {scrollThumb.visible && (
              <div className="px-5 pb-4">
                <div
                  className="relative h-1.5 w-full rounded-full bg-[#eef0ef]"
                  onClick={(event) => {
                    const scrollEl = tableScrollRef.current
                    if (!scrollEl) return
                    const trackRect = event.currentTarget.getBoundingClientRect()
                    const ratio = (event.clientX - trackRect.left) / trackRect.width
                    scrollEl.scrollLeft = ratio * scrollEl.scrollWidth - scrollEl.clientWidth / 2
                  }}
                >
                  <div
                    onPointerDown={handleThumbPointerDown}
                    className="absolute top-0 h-1.5 cursor-grab touch-none rounded-full bg-[#c7cdd8] transition-colors hover:bg-[#a7afbe] active:cursor-grabbing"
                    style={{ width: `${scrollThumb.widthPct}%`, left: `${scrollThumb.leftPct}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal ubah peserta */}
      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Ubah Peserta"
        maxWidth="500px"
      >
        <FormPeserta
          peserta={peserta}
          onSuccess={() => {
            setIsEditOpen(false)
            fetchDetail()
          }}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>

      {/* Modal konfirmasi hapus */}
      <ConfirmModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Peserta"
        description={`Anda yakin ingin menghapus "${peserta.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
        errorMessage={deleteError}
      />
    </div>
  )
}