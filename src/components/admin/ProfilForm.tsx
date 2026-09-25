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

// Class untuk Card dengan efek 3D halus dan dukungan dark mode
const CARD_CLASS =
  "group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"

// Class untuk Input dengan efek inner shadow dan focus ring
const INPUT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"

const TIPE_FOTO_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"]
const MAKS_UKURAN_FOTO = 2 * 1024 * 1024 // 2MB

/* ===== ICONS ===== */
function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 12.5L9.5 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <path d="M4 8.5C4 7.4 4.9 6.5 6 6.5H8L9 4.5H15L16 6.5H18C19.1 6.5 20 7.4 20 8.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="3.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconImage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ===== KOMPONEN PESAN ===== */
function PesanBox({ pesan }: { pesan: Pesan }) {
  if (!pesan) return null

  const isSukses = pesan.tipe === "sukses"
  
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
        isSukses 
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
          : "border-destructive/20 bg-destructive/10 text-destructive dark:text-red-400"
      }`}
    >
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isSukses ? "bg-emerald-500/20" : "bg-destructive/20"}`}>
        {isSukses ? <IconCheck className="h-3.5 w-3.5" /> : <IconAlert className="h-3.5 w-3.5" />}
      </div>
      {pesan.teks}
    </div>
  )
}

/* ===== KOMPONEN UTAMA ===== */
export function ProfilForm({ initialData }: { initialData: ProfilData }) {
  const router = useRouter()
  const { update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nama, setNama] = useState(initialData.nama)
  const [email, setEmail] = useState(initialData.email)
  const [fotoUrl, setFotoUrl] = useState(initialData.fotoUrl ?? "")
  const [savingProfil, setSavingProfil] = useState(false)
  const [pesanProfil, setPesanProfil] = useState<Pesan>(null)

  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)

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
    <div className="flex flex-col gap-8">
      
      {/* ===== SECTION 1: INFORMASI PROFIL ===== */}
      <section className={CARD_CLASS}>
        {/* Dekorasi Gradient di atas card */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IconUser className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Informasi Profil</h2>
              <p className="text-xs text-muted-foreground">Perbarui nama, email, dan foto profil Anda.</p>
            </div>
          </div>

          <form onSubmit={handleSubmitProfil} className="flex flex-col gap-8 sm:flex-row">
            
            {/* Kolom Foto */}
            <div className="flex shrink-0 flex-col items-center gap-3 sm:w-[150px]">
              <div className="relative group/avatar">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg ring-1 ring-border transition-transform duration-300 group-hover/avatar:scale-105">
                  <Image 
                    src={sumberFoto} 
                    alt={nama} 
                    fill 
                    sizes="96px" 
                    className="object-cover" 
                  />
                  {uploadingFoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFoto}
                  aria-label="Ganti foto profil"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-all hover:scale-110 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <IconCamera className="h-4 w-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFotoDipilih}
                  className="hidden"
                />
              </div>
              <p className="text-center text-[11px] leading-snug text-muted-foreground">
                Klik ikon kamera untuk mengganti foto. Maks 2MB.
              </p>
            </div>

            {/* Kolom Form */}
            <div className="flex flex-1 flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Nama Lengkap</span>
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    minLength={2}
                    className={INPUT_CLASS}
                    placeholder="Masukkan nama lengkap"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className={INPUT_CLASS}
                    placeholder="nama@email.com"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Foto Profil (URL)</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Opsional</span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <IconImage className="h-4 w-4" />
                  </div>
                  <input
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com/foto.jpg"
                    className={`${INPUT_CLASS} pl-10`}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Alternatif jika tidak ingin mengunggah file.</p>
              </label>

              <PesanBox pesan={pesanProfil} />

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfil}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-primary to-primary/90 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] transition-all hover:brightness-110 hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                >
                  {savingProfil ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ===== SECTION 2: UBAH KATA SANDI ===== */}
      <section className={CARD_CLASS}>
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <IconLock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ubah Kata Sandi</h2>
              <p className="text-xs text-muted-foreground">Gunakan kata sandi yang kuat dan unik.</p>
            </div>
          </div>

          <form onSubmit={handleSubmitPassword} className="flex max-w-[480px] flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Kata Sandi Saat Ini</span>
              <input
                value={passwordSaatIni}
                onChange={(e) => setPasswordSaatIni(e.target.value)}
                type="password"
                required
                className={INPUT_CLASS}
                placeholder="••••••••"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">Kata Sandi Baru</span>
                <input
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  type="password"
                  required
                  minLength={6}
                  className={INPUT_CLASS}
                  placeholder="Minimal 6 karakter"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">Konfirmasi Kata Sandi</span>
                <input
                  value={konfirmasiPasswordBaru}
                  onChange={(e) => setKonfirmasiPasswordBaru(e.target.value)}
                  type="password"
                  required
                  minLength={6}
                  className={INPUT_CLASS}
                  placeholder="Ulangi kata sandi baru"
                />
              </label>
            </div>

            <PesanBox pesan={pesanPassword} />

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:brightness-110 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 dark:bg-primary dark:text-primary-foreground dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
              >
                {savingPassword ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Menyimpan...
                  </>
                ) : (
                  "Ubah Kata Sandi"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}