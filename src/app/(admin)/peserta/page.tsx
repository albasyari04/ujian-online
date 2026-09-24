"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

import { FormPeserta } from "@/components/admin/FormPeserta"
import { Button } from "@/components/ui/Button"
import { Card, StatCard } from "@/components/ui/Card"
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconPencil,
  IconSearch,
  IconSpinner,
  IconTrash,
  IconUserPlus,
  IconUsers,
} from "@/components/ui/Icons"
import { ConfirmModal, Modal } from "@/components/ui/Modal"

type PesertaItem = {
  id: string
  nama: string
  email: string
  nisn: string | null
  noUrut: number | null
  createdAt: string
  _count: { hasilUjian: number }
}

type Stats = {
  totalPeserta: number
  ujianSelesai: number
  rataRataSkor: number | null
}

type ListResponse = {
  items: PesertaItem[]
  total: number
  page: number
  totalPages: number
  stats: Stats
}

const formatterTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export default function PesertaPage() {
  const [data, setData] = useState<ListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [errorMessage, setErrorMessage] = useState("")

  const [modalMode, setModalMode] = useState<"tambah" | "edit" | null>(null)
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaItem | null>(null)
  const [pesertaToDelete, setPesertaToDelete] = useState<PesertaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

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

  const fetchData = useCallback(async (currentPage: number, currentQuery: string) => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const params = new URLSearchParams({ page: String(currentPage) })
      if (currentQuery) params.set("q", currentQuery)

      const response = await fetch(`/api/peserta?${params.toString()}`)
      if (!response.ok) throw new Error("Gagal memuat data peserta")

      const result: ListResponse = await response.json()
      setData(result)
    } catch {
      setErrorMessage("Gagal memuat data peserta. Coba muat ulang halaman.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchData(page, query)
    }, 0)

    return () => clearTimeout(timeout)
  }, [fetchData, page, query])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      setQuery(searchInput.trim())
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    updateScrollThumb()
    window.addEventListener("resize", updateScrollThumb)
    return () => window.removeEventListener("resize", updateScrollThumb)
  }, [updateScrollThumb, data])

  function handleFormSuccess() {
    setModalMode(null)
    setSelectedPeserta(null)
    fetchData(page, query)
  }

  async function handleDelete() {
    if (!pesertaToDelete) return
    setIsDeleting(true)
    setDeleteError("")

    try {
      const response = await fetch(`/api/peserta/${pesertaToDelete.id}`, { method: "DELETE" })
      const result = await response.json()

      if (!response.ok) {
        setDeleteError(result.message ?? "Gagal menghapus peserta.")
        return
      }

      setPesertaToDelete(null)
      fetchData(page, query)
    } catch {
      setDeleteError("Gagal terhubung ke server. Periksa koneksi Anda.")
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = data?.stats
  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#007fc4] sm:text-[12px]">
            Ujian Online
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#16233f] sm:text-[26px]">Kelola Peserta</h1>
          <p className="mt-1 text-[12px] text-[#5b657d] sm:text-[13px]">
            Kelola akun peserta ujian: tambah, ubah, hapus, dan lihat riwayat ujian.
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedPeserta(null)
            setModalMode("tambah")
          }}
          className="shrink-0 px-3 py-2 text-[12px] sm:px-4 sm:py-2.5 sm:text-[13px]"
        >
          <IconUserPlus className="h-4 w-4" />
          Tambah Peserta
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard
          label="Total Peserta"
          value={stats ? stats.totalPeserta : "–"}
          iconImageSrc="/image/icon/total-peserta-icon.png"
          tone="emerald"
        />
        <StatCard
          label="Ujian Diselesaikan"
          value={stats ? stats.ujianSelesai : "–"}
          iconImageSrc="/image/icon/ujian-selesai-icon.png"
          tone="blue"
        />
        <StatCard
          label="Rata-rata Skor"
          value={stats && stats.rataRataSkor !== null ? stats.rataRataSkor.toFixed(1) : "–"}
          iconImageSrc="/image/icon/rata-rata-score.png"
          tone="amber"
        />
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            type="search"
            placeholder="Cari nama, email, atau NISN..."
            aria-label="Cari peserta"
            className="h-10 w-full rounded-[10px] border border-[#e7e4dc] bg-[#f7f9f8] pl-10 pr-3.5 text-[13px] text-[#34435f] placeholder:text-[#94a3b8] transition-colors focus:border-[#6ee7b7] focus:bg-white focus:outline-none"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {errorMessage ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <IconAlertTriangle className="h-8 w-8 text-[#d23b3b]" />
            <p className="text-[13px] text-[#5b657d]">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => fetchData(page, query)}>
              Coba lagi
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <IconSpinner className="h-6 w-6 animate-spin text-[#007fc4]" />
            <p className="text-[13px] text-[#8b93a6]">Memuat data peserta...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d9f4ff] text-[#007fc4]">
              <IconUsers className="h-6 w-6" />
            </span>
            <p className="text-[14px] font-medium text-[#16233f]">
              {query ? "Peserta tidak ditemukan" : "Belum ada peserta"}
            </p>
            <p className="max-w-xs text-[12.5px] text-[#8b93a6]">
              {query
                ? `Tidak ada peserta yang cocok dengan pencarian "${query}".`
                : "Tambahkan peserta pertama untuk mulai mengelola akun ujian."}
            </p>
          </div>
        ) : (
          <>
            <div ref={tableScrollRef} onScroll={updateScrollThumb} className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#edf0ef] bg-[#f7f9f8]">
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      No. Urut
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Nama
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      NISN
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Email
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Terdaftar
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Ujian
                    </th>
                    <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((peserta) => (
                    <tr
                      key={peserta.id}
                      className="border-b border-[#f0f2f1] last:border-0 hover:bg-[#f7f9f8]"
                    >
                      <td className="px-5 py-3.5 text-[12.5px] font-semibold text-[#5b657d]">
                        {peserta.noUrut ?? "–"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#007fc4] to-[#00a7ff] text-[11.5px] font-semibold text-white shadow-[0_4px_8px_rgba(0,126,196,0.2)]">
                            {peserta.nama.charAt(0).toUpperCase()}
                          </span>
                          <Link
                            href={`/peserta/${peserta.id}`}
                            className="truncate text-[13px] font-medium text-[#16233f] hover:text-[#007fc4]"
                          >
                            {peserta.nama}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] font-mono text-[#5b657d]">
                        {peserta.nisn ?? "–"}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#5b657d]">{peserta.email}</td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#5b657d]">
                        {formatterTanggal.format(new Date(peserta.createdAt))}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#5b657d]">
                        {peserta._count.hasilUjian} ujian
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/peserta/${peserta.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#5b657d] hover:bg-[#f0f2f1] hover:text-[#16233f]"
                            aria-label={`Lihat detail ${peserta.nama}`}
                          >
                            <IconEye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPeserta(peserta)
                              setModalMode("edit")
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#007fc4] hover:bg-[#d9f4ff]"
                            aria-label={`Ubah ${peserta.nama}`}
                          >
                            <IconPencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPesertaToDelete(peserta)
                              setDeleteError("")
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#d23b3b] hover:bg-[#fdf1f1]"
                            aria-label={`Hapus ${peserta.nama}`}
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {scrollThumb.visible && (
              <div className="px-5 pb-3">
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

            {data && (
              <div className="flex items-center justify-between border-t border-[#edf0ef] px-5 py-3.5">
                <p className="text-[12px] text-[#8b93a6]">
                  Halaman {data.page} dari {totalPages} &middot; {data.total} peserta
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#5b657d] hover:bg-[#f0f2f1] disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Halaman sebelumnya"
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={page >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#5b657d] hover:bg-[#f0f2f1] disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Halaman berikutnya"
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={modalMode !== null}
        onClose={() => {
          setModalMode(null)
          setSelectedPeserta(null)
        }}
        title={modalMode === "edit" ? "Ubah Peserta" : "Tambah Peserta"}
      >
        <FormPeserta
          peserta={selectedPeserta ?? undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setModalMode(null)
            setSelectedPeserta(null)
          }}
        />
      </Modal>

      <ConfirmModal
        open={pesertaToDelete !== null}
        onClose={() => setPesertaToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Peserta"
        description={`Anda yakin ingin menghapus "${pesertaToDelete?.nama ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
        errorMessage={deleteError}
      />
    </div>
  )
}