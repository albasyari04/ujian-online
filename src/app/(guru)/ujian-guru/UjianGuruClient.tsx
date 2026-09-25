"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import {
  IconPlus,
  IconSearch,
  IconPencil,
  IconTrash,
  IconDocument,
  IconUsers,
  IconClock,
} from "@/components/ui/Icons"

type Ujian = {
  id: string
  judul: string
  deskripsi: string | null
  durasiMenit: number
  acakSoal: boolean
  batasPelanggaran: number
  mulai: string | Date
  selesai: string | Date
  _count: { soal: number; hasilUjian: number }
}

type FormState = {
  judul: string
  deskripsi: string
  durasiMenit: string
  acakSoal: boolean
  batasPelanggaran: string
  mulai: string
  selesai: string
}

const FORM_KOSONG: FormState = {
  judul: "",
  deskripsi: "",
  durasiMenit: "60",
  acakSoal: false,
  batasPelanggaran: "3",
  mulai: "",
  selesai: "",
}

function toDatetimeLocal(value: string | Date) {
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatRentang(mulai: string | Date, selesai: string | Date) {
  const fmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
  return `${fmt.format(new Date(mulai))} – ${fmt.format(new Date(selesai))}`
}

function statusUjian(mulai: string | Date, selesai: string | Date) {
  const now = new Date()
  const m = new Date(mulai)
  const s = new Date(selesai)
  if (now < m) return { key: "akan-datang" as const, label: "Akan Datang", tone: "amber" as const }
  if (now > s) return { key: "selesai" as const, label: "Selesai", tone: "slate" as const }
  return { key: "berlangsung" as const, label: "Berlangsung", tone: "emerald" as const }
}

const TAB_FILTER = [
  { key: "semua", label: "Semua" },
  { key: "akan-datang", label: "Akan Datang" },
  { key: "berlangsung", label: "Berlangsung" },
  { key: "selesai", label: "Selesai" },
] as const

export function UjianGuruClient({ ujianAwal, cariAwal }: { ujianAwal: Ujian[]; cariAwal: string }) {
  const router = useRouter()
  const [daftar, setDaftar] = useState(ujianAwal)
  const [cari, setCari] = useState(cariAwal)
  const [tab, setTab] = useState<(typeof TAB_FILTER)[number]["key"]>("semua")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ujian | null>(null)
  const [form, setForm] = useState<FormState>(FORM_KOSONG)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [hapusTarget, setHapusTarget] = useState<Ujian | null>(null)
  const [deleting, setDeleting] = useState(false)

  const hasilFilter = useMemo(() => {
    return daftar.filter((u) => {
      const cocokCari = u.judul.toLowerCase().includes(cari.trim().toLowerCase())
      const cocokTab = tab === "semua" || statusUjian(u.mulai, u.selesai).key === tab
      return cocokCari && cocokTab
    })
  }, [daftar, cari, tab])

  function bukaModalBuat() {
    setEditing(null)
    setForm(FORM_KOSONG)
    setError("")
    setModalOpen(true)
  }

  function bukaModalEdit(u: Ujian) {
    setEditing(u)
    setForm({
      judul: u.judul,
      deskripsi: u.deskripsi ?? "",
      durasiMenit: String(u.durasiMenit),
      acakSoal: u.acakSoal,
      batasPelanggaran: String(u.batasPelanggaran),
      mulai: toDatetimeLocal(u.mulai),
      selesai: toDatetimeLocal(u.selesai),
    })
    setError("")
    setModalOpen(true)
  }

  function ubahCari(nilai: string) {
    setCari(nilai)
    const params = new URLSearchParams(window.location.search)
    if (nilai) params.set("cari", nilai)
    else params.delete("cari")
    router.replace(`/ujian-guru?${params.toString()}`)
  }

  async function simpan() {
    setSaving(true)
    setError("")

    const payload = {
      judul: form.judul,
      deskripsi: form.deskripsi || undefined,
      durasiMenit: form.durasiMenit,
      acakSoal: form.acakSoal,
      batasPelanggaran: form.batasPelanggaran,
      mulai: form.mulai ? new Date(form.mulai).toISOString() : "",
      selesai: form.selesai ? new Date(form.selesai).toISOString() : "",
    }

    try {
      const res = await fetch(editing ? `/api/ujian/${editing.id}` : "/api/ujian", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? "Gagal menyimpan ujian")
        return
      }

      if (editing) {
        setDaftar((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...json } : u)))
      } else {
        setDaftar((prev) => [{ ...json, _count: { soal: 0, hasilUjian: 0 } }, ...prev])
      }

      setModalOpen(false)
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  async function konfirmasiHapus() {
    if (!hapusTarget) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/ujian/${hapusTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        setDaftar((prev) => prev.filter((u) => u.id !== hapusTarget.id))
        setHapusTarget(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold text-[#16233f] dark:text-white">Ujian Saya</h1>
          <p className="mt-0.5 text-[13px] text-[#5b657d] dark:text-white/50">Kelola seluruh ujian yang Anda buat.</p>
        </div>
        <Button onClick={bukaModalBuat} className="shrink-0">
          <IconPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Buat Ujian</span>
          <span className="sm:hidden">Buat</span>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-[11px] border border-white/50 bg-white/45 px-3.5 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05] sm:max-w-[320px]">
          <IconSearch className="h-4 w-4 shrink-0 text-[#94a3b8]" />
          <input
            value={cari}
            onChange={(e) => ubahCari(e.target.value)}
            placeholder="Cari judul ujian..."
            className="w-full bg-transparent text-[13px] text-[#34435f] placeholder:text-[#94a3b8] focus:outline-none dark:text-white/80"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TAB_FILTER.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium backdrop-blur-md transition-all ${
                tab === t.key
                  ? "border-transparent bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_18px_-6px_rgba(67,56,202,0.55)]"
                  : "border-white/50 bg-white/35 text-[#5b657d] hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50 dark:hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {hasilFilter.length === 0 ? (
        <Card variant="glass" className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
          <IconDocument className="h-9 w-9 text-[#c7cdd8]" />
          <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">
            {daftar.length === 0 ? "Belum ada ujian yang Anda buat." : "Tidak ada ujian yang cocok dengan pencarian."}
          </p>
          {daftar.length === 0 && (
            <Button size="sm" variant="outline" onClick={bukaModalBuat} className="mt-1">
              <IconPlus className="h-3.5 w-3.5" />
              Buat ujian pertama
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hasilFilter.map((u) => {
            const status = statusUjian(u.mulai, u.selesai)
            const subjectIconSrc = getSubjectIconSrc(u.judul)
            return (
              <Card
                key={u.id}
                variant="glass"
                className="
                  group flex flex-col gap-3 p-4
                  transition-all duration-200 ease-out
                  hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_10px_24px_-10px_rgba(22,35,63,0.1),0_32px_52px_-18px_rgba(49,46,129,0.38)]
                  dark:hover:bg-white/[0.1]
                "
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => bukaModalEdit(u)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b93a6] hover:bg-[#f4f5f7] dark:text-white/40 dark:hover:bg-white/10"
                      aria-label="Edit ujian"
                    >
                      <IconPencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setHapusTarget(u)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#d23b3b] hover:bg-[#fdf1f1] dark:hover:bg-red-500/10"
                      aria-label="Hapus ujian"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Link href={`/ujian-guru/${u.id}`} className="flex items-center gap-2.5">
                  <Image
                    src={subjectIconSrc}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_10px_16px_rgba(49,46,129,0.25)] transition-transform duration-200 ease-out group-hover:-rotate-3 group-hover:scale-105"
                  />
                  <h3 className="line-clamp-2 min-w-0 flex-1 text-[14.5px] font-semibold text-[#16233f] group-hover:text-[#4338ca] dark:text-white dark:group-hover:text-[#818cf8]">
                    {u.judul}
                  </h3>
                </Link>

                <div className="flex items-center gap-1.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                  <IconClock className="h-3.5 w-3.5" />
                  {formatRentang(u.mulai, u.selesai)}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[#edf0ef] pt-3 text-[12px] text-[#5b657d] dark:border-white/10 dark:text-white/50">
                  <span className="flex items-center gap-1.5">
                    <IconDocument className="h-3.5 w-3.5" />
                    {u._count.soal} soal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconUsers className="h-3.5 w-3.5" />
                    {u._count.hasilUjian} peserta
                  </span>
                  <span>{u.durasiMenit} menit</span>
                </div>

                <Link
                  href={`/ujian-guru/${u.id}`}
                  className="mt-1 rounded-[10px] bg-[#f7f9f8] py-2 text-center text-[12.5px] font-medium text-[#34435f] hover:bg-[#eef2ff] hover:text-[#4338ca] dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                >
                  Kelola Soal & Hasil
                </Link>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Ujian" : "Buat Ujian Baru"}>
        <div className="space-y-3.5">
          {error && (
            <p className="rounded-[10px] bg-[#fdf1f1] px-3 py-2 text-[12.5px] text-[#d23b3b] dark:bg-red-500/10">
              {error}
            </p>
          )}

          <div>
            <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Judul Ujian</label>
            <input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Contoh: Ulangan Harian Matematika Bab 3"
              className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2.5 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Deskripsi (opsional)</label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2.5 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Mulai</label>
              <input
                type="datetime-local"
                value={form.mulai}
                onChange={(e) => setForm({ ...form, mulai: e.target.value })}
                className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Selesai</label>
              <input
                type="datetime-local"
                value={form.selesai}
                onChange={(e) => setForm({ ...form, selesai: e.target.value })}
                className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Durasi (menit)</label>
              <input
                type="number"
                min={1}
                value={form.durasiMenit}
                onChange={(e) => setForm({ ...form, durasiMenit: e.target.value })}
                className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Batas Pelanggaran</label>
              <input
                type="number"
                min={0}
                value={form.batasPelanggaran}
                onChange={(e) => setForm({ ...form, batasPelanggaran: e.target.value })}
                className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#34435f] dark:text-white/70">
            <input
              type="checkbox"
              checked={form.acakSoal}
              onChange={(e) => setForm({ ...form, acakSoal: e.target.checked })}
              className="h-4 w-4 rounded border-[#e7e4dc] text-[#4338ca] focus:ring-[#818cf8]"
            />
            Acak urutan soal untuk setiap peserta
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={simpan} isLoading={saving}>
              {editing ? "Simpan Perubahan" : "Buat Ujian"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!hapusTarget} onClose={() => setHapusTarget(null)} title="Hapus Ujian?" maxWidth="max-w-sm">
        <p className="text-[13px] text-[#5b657d] dark:text-white/60">
          Ujian <span className="font-semibold text-[#16233f] dark:text-white">&ldquo;{hapusTarget?.judul}&rdquo;</span>{" "}
          beserta seluruh soal dan hasil ujiannya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setHapusTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={konfirmasiHapus} isLoading={deleting}>
            Ya, Hapus
          </Button>
        </div>
      </Modal>
    </div>
  )
}