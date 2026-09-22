"use client"

import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

type ProfilData = {
  id: string
  nama: string
  email: string
  fotoUrl: string | null
}

type Pesan = { tipe: "sukses" | "error"; teks: string } | null

const CARD =
  "rounded-[18px] border border-[#dce7ee] bg-gradient-to-b from-white to-[#f7fbfd] shadow-[0_10px_28px_rgba(0,56,104,0.08),0_2px_6px_rgba(0,56,104,0.05)] p-5 sm:p-6"

const INPUT_CLASS =
  "rounded-[10px] border border-[#dce7ee] px-3.5 py-2.5 text-[13px] text-[#16233f] focus:border-[#007fc4] focus:outline-none"

const TIPE_FOTO_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"]
const MAKS_UKURAN_FOTO = 2 * 1024 * 1024 // 2MB

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 12.5L9.5 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 4L21 19.5H3L12 4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
    </svg>
  )
}

function IconCamera({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 8.5C4 7.4 4.9 6.5 6 6.5H8L9 4.5H15L16 6.5H18C19.1 6.5 20 7.4 20 8.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function PesanBox({ pesan }: { pesan: Pesan }) {
  if (!pesan) return null

  return (
    <div
      className={`flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[12px] font-medium ${
        pesan.tipe === "sukses" ? "bg-[#e8f8ee] text-[#1a8a4a]" : "bg-[#fdf1f1] text-[#d23b3b]"
      }`}
    >
      {pesan.tipe === "sukses" ? (
        <IconCheck className="h-4 w-4 shrink-0" />
      ) : (
        <IconAlert className="h-4 w-4 shrink-0" />
      )}
      {pesan.teks}
    </div>
  )
}

export function ProfilForm({ initialData }: { initialData: ProfilData }) {
  const router = useRouter()
  const { update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ===== Form informasi profil ===== */
  const [nama, setNama] = useState(initialData.nama)
  const [email, setEmail] = useState(initialData.email)
  const [fotoUrl, setFotoUrl] = useState(initialData.fotoUrl ?? "")
  const [savingProfil, setSavingProfil] = useState(false)
  const [pesanProfil, setPesanProfil] = useState<Pesan>(null)

  /* ===== Upload foto profil ===== */
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)

  /* ===== Form ubah kata sandi ===== */
  const [passwordSaatIni, setPasswordSaatIni] = useState("")
  const [passwordBaru, setPasswordBaru] = useState("")
  const [konfirmasiPasswordBaru, setKonfirmasiPasswordBaru] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [pesanPassword, setPesanPassword] = useState<Pesan>(null)

  async function handleSubmitProfil(event: FormEvent) {
    event.preventDefault()
    setSavingProfil(true)
    setPesanProfil(null)

    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, fotoUrl }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPesanProfil({ tipe: "error", teks: data.message ?? "Gagal memperbarui profil" })
        return
      }

      // Sinkronkan sesi supaya nama/email/foto baru langsung terlihat di navbar
      // tanpa perlu login ulang (lihat callback jwt trigger "update" di lib/auth.ts).
      await update({ name: nama, email, fotoUrl: fotoUrl.trim() === "" ? null : fotoUrl })
      setPesanProfil({ tipe: "sukses", teks: "Profil berhasil diperbarui" })
      router.refresh()
    } catch {
      setPesanProfil({ tipe: "error", teks: "Terjadi kesalahan, coba lagi" })
    } finally {
      setSavingProfil(false)
    }
  }

  async function handleFotoDipilih(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset value input supaya user bisa pilih file yang sama lagi kalau perlu.
    event.target.value = ""
    if (!file) return

    if (!TIPE_FOTO_DIIZINKAN.includes(file.type)) {
      setPesanProfil({ tipe: "error", teks: "Format file harus JPG, PNG, atau WEBP" })
      return
    }

    if (file.size > MAKS_UKURAN_FOTO) {
      setPesanProfil({ tipe: "error", teks: "Ukuran file maksimal 2MB" })
      return
    }

    const urlPreview = URL.createObjectURL(file)
    setPreviewFoto(urlPreview)
    setUploadingFoto(true)
    setPesanProfil(null)

    try {
      const formData = new FormData()
      formData.append("foto", file)

      const res = await fetch("/api/profil/foto", {
        method: "POST",
        body: formData,
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setPesanProfil({ tipe: "error", teks: data.error ?? "Gagal mengunggah foto" })
        return
      }

      setFotoUrl(data.fotoUrl)
      await update({ fotoUrl: data.fotoUrl })
      setPesanProfil({ tipe: "sukses", teks: "Foto profil berhasil diperbarui" })
      router.refresh()
    } catch {
      setPesanProfil({ tipe: "error", teks: "Terjadi kesalahan jaringan, coba lagi" })
    } finally {
      setUploadingFoto(false)
      URL.revokeObjectURL(urlPreview)
      setPreviewFoto(null)
    }
  }

  async function handleSubmitPassword(event: FormEvent) {
    event.preventDefault()

    if (passwordBaru !== konfirmasiPasswordBaru) {
      setPesanPassword({ tipe: "error", teks: "Konfirmasi kata sandi tidak cocok" })
      return
    }

    setSavingPassword(true)
    setPesanPassword(null)

    try {
      const res = await fetch("/api/profil/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordSaatIni, passwordBaru, konfirmasiPasswordBaru }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPesanPassword({ tipe: "error", teks: data.message ?? "Gagal mengubah kata sandi" })
        return
      }

      setPesanPassword({ tipe: "sukses", teks: "Kata sandi berhasil diubah" })
      setPasswordSaatIni("")
      setPasswordBaru("")
      setKonfirmasiPasswordBaru("")
    } catch {
      setPesanPassword({ tipe: "error", teks: "Terjadi kesalahan, coba lagi" })
    } finally {
      setSavingPassword(false)
    }
  }

  const sumberFoto = previewFoto ?? (fotoUrl.trim() !== "" ? fotoUrl : "/image/icon/user-icon.png")

  return (
    <div className="flex flex-col gap-6">
      {/* ===== INFORMASI PROFIL ===== */}
      <section className={CARD}>
        <h2 className="text-[15px] font-semibold text-[#16233f]">Informasi Profil</h2>
        <p className="mt-1 text-[11.5px] text-[#8b93a6]">Perbarui nama, email, dan foto profil Anda.</p>

        <form onSubmit={handleSubmitProfil} className="mt-5 flex flex-col gap-5 sm:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-2 sm:w-[130px]">
            <div className="relative h-20 w-20">
              <span className="relative block h-20 w-20 overflow-hidden rounded-full bg-[#e7e4dc] ring-2 ring-[#dce7ee]">
                <Image src={sumberFoto} alt={nama} fill sizes="80px" className="object-cover" />
                {uploadingFoto && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </span>
                )}
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFoto}
                aria-label="Ganti foto profil"
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#007fc4] text-white shadow-[0_2px_6px_rgba(0,56,104,0.3)] transition-colors hover:bg-[#006ba8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <IconCamera className="h-3.5 w-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoDipilih}
                className="hidden"
              />
            </div>
            <p className="text-center text-[10.5px] leading-snug text-[#8b93a6]">
              Klik ikon kamera untuk ganti foto
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[#34435f]">Nama Lengkap</span>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                minLength={2}
                className={INPUT_CLASS}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[#34435f]">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className={INPUT_CLASS}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[#34435f]">
                Foto Profil (URL) <span className="font-normal text-[#8b93a6]">— opsional, alternatif dari upload</span>
              </span>
              <input
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                type="url"
                placeholder="https://..."
                className={INPUT_CLASS}
              />
            </label>

            <PesanBox pesan={pesanProfil} />

            <button
              type="submit"
              disabled={savingProfil}
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#007fc4] to-[#00a7ff] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_5px_12px_rgba(0,126,196,0.28)] transition-opacity hover:brightness-105 disabled:opacity-60"
            >
              {savingProfil ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </section>

      {/* ===== UBAH KATA SANDI ===== */}
      <section className={CARD}>
        <h2 className="text-[15px] font-semibold text-[#16233f]">Ubah Kata Sandi</h2>
        <p className="mt-1 text-[11.5px] text-[#8b93a6]">
          Gunakan kata sandi yang kuat dan tidak dipakai di tempat lain.
        </p>

        <form onSubmit={handleSubmitPassword} className="mt-5 flex max-w-[420px] flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-medium text-[#34435f]">Kata Sandi Saat Ini</span>
            <input
              value={passwordSaatIni}
              onChange={(e) => setPasswordSaatIni(e.target.value)}
              type="password"
              required
              className={INPUT_CLASS}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-medium text-[#34435f]">Kata Sandi Baru</span>
            <input
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              type="password"
              required
              minLength={6}
              className={INPUT_CLASS}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-medium text-[#34435f]">Konfirmasi Kata Sandi Baru</span>
            <input
              value={konfirmasiPasswordBaru}
              onChange={(e) => setKonfirmasiPasswordBaru(e.target.value)}
              type="password"
              required
              minLength={6}
              className={INPUT_CLASS}
            />
          </label>

          <PesanBox pesan={pesanPassword} />

          <button
            type="submit"
            disabled={savingPassword}
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#16233f] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_5px_12px_rgba(22,35,63,0.28)] transition-opacity hover:brightness-110 disabled:opacity-60"
          >
            {savingPassword ? "Menyimpan..." : "Ubah Kata Sandi"}
          </button>
        </form>
      </section>
    </div>
  )
}