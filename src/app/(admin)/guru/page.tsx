"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"

import { FormGuru } from "@/components/admin/FormGuru"
import { Button } from "@/components/ui/Button"
import { Card, StatCard } from "@/components/ui/Card"
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconSearch,
  IconSpinner,
  IconTrash,
  IconUserPlus,
  IconUsers,
} from "@/components/ui/Icons"
import { ConfirmModal, Modal } from "@/components/ui/Modal"

type GuruItem = {
  id: string
  nama: string
  email: string
  createdAt: string
  _count: { ujianDibuat: number }
}

type Stats = {
  totalGuru: number
  totalUjianDibuat: number
}

type ListResponse = {
  items: GuruItem[]
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

export default function GuruPage() {
  const [data, setData] = useState<ListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [errorMessage, setErrorMessage] = useState("")

  const [modalMode, setModalMode] = useState<"tambah" | "edit" | null>(null)
  const [selectedGuru, setSelectedGuru] = useState<GuruItem | null>(null)
  const [guruToDelete, setGuruToDelete] = useState<GuruItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchData = useCallback(async (currentPage: number, currentQuery: string) => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const params = new URLSearchParams({ page: String(currentPage) })
      if (currentQuery) params.set("q", currentQuery)

      const response = await fetch(`/api/guru?${params.toString()}`)
      if (!response.ok) throw new Error("Gagal memuat data guru")

      const result: ListResponse = await response.json()
      setData(result)
    } catch {
      setErrorMessage("Gagal memuat data guru. Coba muat ulang halaman.")
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

  function handleFormSuccess() {
    setModalMode(null)
    setSelectedGuru(null)
    fetchData(page, query)
  }

  async function handleDelete() {
    if (!guruToDelete) return
    setIsDeleting(true)
    setDeleteError("")

    try {
      const response = await fetch(`/api/guru/${guruToDelete.id}`, { method: "DELETE" })
      const result = await response.json()

      if (!response.ok) {
        setDeleteError(result.message ?? "Gagal menghapus guru.")
        return
      }

      setGuruToDelete(null)
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
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#16233f] dark:text-white sm:text-[26px]">
            Kelola Guru
          </h1>
          <p className="mt-1 text-[12px] text-[#5b657d] dark:text-white/50 sm:text-[13px]">
            Kelola akun guru: tambah, ubah, hapus, dan lihat jumlah ujian yang mereka buat.
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedGuru(null)
            setModalMode("tambah")
          }}
          className="shrink-0 px-3 py-2 text-[12px] sm:px-4 sm:py-2.5 sm:text-[13px]"
        >
          <IconUserPlus className="h-4 w-4" />
          Tambah Guru
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <StatCard
          label="Total Guru"
          value={stats ? stats.totalGuru : "–"}
          iconImageSrc="/image/icon/total-guru-icon.png"
          tone="violet"
        />
        <StatCard
          label="Ujian Dibuat Guru"
          value={stats ? stats.totalUjianDibuat : "–"}
          iconImageSrc="/image/icon/ujian-dibuat-guru-icon.png"
          tone="blue"
        />
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8] dark:text-white/30" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            type="search"
            placeholder="Cari nama atau email guru..."
            aria-label="Cari guru"
            className="h-10 w-full rounded-[10px] border border-[#e7e4dc] bg-[#f7f9f8] pl-10 pr-3.5 text-[13px] text-[#34435f] placeholder:text-[#94a3b8] transition-colors focus:border-[#6ee7b7] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#6ee7b7]/60 dark:focus:bg-white/[0.06]"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {errorMessage ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <IconAlertTriangle className="h-8 w-8 text-[#d23b3b]" />
            <p className="text-[13px] text-[#5b657d] dark:text-white/50">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => fetchData(page, query)}>
              Coba lagi
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <IconSpinner className="h-6 w-6 animate-spin text-[#007fc4]" />
            <p className="text-[13px] text-[#8b93a6] dark:text-white/40">Memuat data guru...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d9f4ff] text-[#007fc4] dark:bg-white/10">
              <IconUsers className="h-6 w-6" />
            </span>
            <p className="text-[14px] font-medium text-[#16233f] dark:text-white">
              {query ? "Guru tidak ditemukan" : "Belum ada guru"}
            </p>
            <p className="max-w-xs text-[12.5px] text-[#8b93a6] dark:text-white/40">
              {query
                ? `Tidak ada guru yang cocok dengan pencarian "${query}".`
                : "Tambahkan guru pertama untuk mulai mengelola ujian mereka."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#edf0ef] bg-[#f7f9f8] dark:border-white/10 dark:bg-white/[0.03]">
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                      Nama
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                      Email
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                      Terdaftar
                    </th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                      Ujian Dibuat
                    </th>
                    <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((guru) => (
                    <tr
                      key={guru.id}
                      className="border-b border-[#f0f2f1] last:border-0 hover:bg-[#f7f9f8] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {/*
                            Avatar diganti dari inisial huruf menjadi
                            icon guru-icon.png yang diberikan, tetap
                            dalam wadah bulat bergradasi ungu (3D).
                          */}
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] p-1.5 shadow-[0_4px_8px_rgba(124,58,237,0.35)]">
                            <Image
                              src="/image/icon/guru-icon.png"
                              alt=""
                              width={20}
                              height={20}
                              className="h-full w-full object-contain brightness-0 invert"
                            />
                          </span>
                          <span className="truncate text-[13px] font-medium text-[#16233f] dark:text-white">
                            {guru.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#5b657d] dark:text-white/50">{guru.email}</td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#5b657d] dark:text-white/50">
                        {formatterTanggal.format(new Date(guru.createdAt))}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#5b657d] dark:text-white/50">
                        {guru._count.ujianDibuat} ujian
                      </td>
                      <td className="px-5 py-3.5">
                        {/*
                          Tombol Ubah & Hapus sekarang punya "card bulat"
                          (rounded-full) permanen dengan warna latar +
                          shadow 3D, bukan cuma muncul saat hover.
                        */}
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGuru(guru)
                              setModalMode("edit")
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f5ff] text-[#007fc4] shadow-[0_3px_8px_-2px_rgba(0,127,196,0.4)] ring-1 ring-inset ring-[#007fc4]/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_12px_-2px_rgba(0,127,196,0.5)] dark:bg-[#007fc4]/15 dark:text-[#63c2f5] dark:ring-white/10"
                            aria-label={`Ubah ${guru.nama}`}
                          >
                            <IconPencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGuruToDelete(guru)
                              setDeleteError("")
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdedee] text-[#d23b3b] shadow-[0_3px_8px_-2px_rgba(210,59,59,0.4)] ring-1 ring-inset ring-[#d23b3b]/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_12px_-2px_rgba(210,59,59,0.5)] dark:bg-[#d23b3b]/15 dark:text-[#f28b8b] dark:ring-white/10"
                            aria-label={`Hapus ${guru.nama}`}
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

            {data && (
              <div className="flex items-center justify-between border-t border-[#edf0ef] px-5 py-3.5 dark:border-white/10">
                <p className="text-[12px] text-[#8b93a6] dark:text-white/40">
                  Halaman {data.page} dari {totalPages} &middot; {data.total} guru
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#5b657d] hover:bg-[#f0f2f1] disabled:opacity-40 disabled:hover:bg-transparent dark:text-white/50 dark:hover:bg-white/10"
                    aria-label="Halaman sebelumnya"
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={page >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#5b657d] hover:bg-[#f0f2f1] disabled:opacity-40 disabled:hover:bg-transparent dark:text-white/50 dark:hover:bg-white/10"
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
          setSelectedGuru(null)
        }}
        title={modalMode === "edit" ? "Ubah Guru" : "Tambah Guru"}
        maxWidth="500px"
      >
        <FormGuru
          guru={selectedGuru ?? undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setModalMode(null)
            setSelectedGuru(null)
          }}
        />
      </Modal>

      <ConfirmModal
        open={guruToDelete !== null}
        onClose={() => setGuruToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Guru"
        description={`Anda yakin ingin menghapus "${guruToDelete?.nama ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
        errorMessage={deleteError}
      />
    </div>
  )
}