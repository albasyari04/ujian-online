"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

type PesertaUser = {
  nama: string
  email: string
  /** URL/path foto profil peserta. Kalau tidak diisi, dipakai foto default
   *  di /image/user-icon.png (lihat komponen AvatarPeserta di bawah). */
  fotoUrl?: string | null
}

/* =========================================================
   ICONS
========================================================= */

function IconMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 6.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 17.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 10.5C6 7 8.7 4.5 12 4.5C15.3 4.5 18 7 18 10.5V14L19.5 16.5H4.5L6 14V10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19C10.4 19.9 11.1 20.5 12 20.5C12.9 20.5 13.6 19.9 14 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20L16.2 16.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconProfil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8.3" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20C5.4 15.6 8 13.2 12 13.2C16 13.2 18.6 15.6 19.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

/* =========================================================
   AVATAR PESERTA
   Selalu menampilkan foto (bukan inisial huruf) — memakai fotoUrl kalau
   ada, atau jatuh ke gambar default /image/user-icon.png.
========================================================= */

function AvatarPeserta({ fotoUrl, nama, className = "h-7 w-7" }: { fotoUrl?: string | null; nama: string; className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-[#e7e4dc] dark:bg-white/10 ${className}`}>
      <Image src={fotoUrl && fotoUrl.trim() !== "" ? fotoUrl : "/image/icon/user-icon.png"} alt={nama} fill sizes="40px" className="object-cover" />
    </span>
  )
}

/* =========================================================
   KOTAK PENCARIAN
   Dipakai untuk varian desktop (selalu terlihat, sejajar dengan
   lonceng & menu akun) maupun varian overlay mobile (menggantikan
   seluruh isi header saat ikon kaca pembesar ditekan).
   Search diarahkan ke halaman "Ujian Tersedia" dengan query ?cari=...
   — sesuaikan target ini kalau nanti ada halaman pencarian khusus.
========================================================= */

function KotakPencarian({
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  className = "",
  inputRef,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  autoFocus?: boolean
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <form onSubmit={onSubmit} className={`relative flex items-center ${className}`}>
      <IconSearch className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#8b93a6] dark:text-white/35" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari ujian, jadwal, atau lainnya..."
        autoFocus={autoFocus}
        className="h-10 w-full rounded-[12px] border border-[#e7e4dc] bg-[#f6f4ec] pl-10 pr-3 text-[13px] text-[#16233f] shadow-[inset_0_1.5px_3px_rgba(22,35,63,0.06)] outline-none transition-all placeholder:text-[#a3aebd] focus:border-[#3457c9]/40 focus:bg-white focus:shadow-[inset_0_1.5px_3px_rgba(22,35,63,0.04),0_0_0_3px_rgba(52,87,201,0.12)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-white/10"
      />
    </form>
  )
}

/* =========================================================
   NAVBAR PESERTA
   Nav link (Beranda / Riwayat Ujian) sekarang ada di SidebarPeserta.
   Navbar ini menampilkan tombol menu (mobile), kotak pencarian,
   notifikasi, dan menu akun.
========================================================= */

export function NavbarPeserta({
  user,
  onMenuClick,
  jumlahNotifikasiBelumDibaca = 0,
}: {
  user: PesertaUser
  onMenuClick: () => void
  jumlahNotifikasiBelumDibaca?: number
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [kataKunci, setKataKunci] = useState("")
  const [cariMobileTerbuka, setCariMobileTerbuka] = useState(false)
  const inputMobileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Tutup overlay pencarian mobile dengan tombol Escape.
  useEffect(() => {
    if (!cariMobileTerbuka) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setCariMobileTerbuka(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [cariMobileTerbuka])

  const namaDepan = user.nama.trim().split(" ")[0] || "Peserta"

  const adaNotifikasiBaru = jumlahNotifikasiBelumDibaca > 0
  const labelBadge = jumlahNotifikasiBelumDibaca > 9 ? "9+" : String(jumlahNotifikasiBelumDibaca)

  function handleCari(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const kunci = kataKunci.trim()
    router.push(kunci ? `/ujian-tersedia?cari=${encodeURIComponent(kunci)}` : "/ujian-tersedia")
    setCariMobileTerbuka(false)
  }

  // Overlay pencarian mobile — menggantikan seluruh isi header selagi aktif,
  // supaya kotak input dapat memakai lebar penuh di layar sempit.
  if (cariMobileTerbuka) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#e7e4dc] bg-[#fbfaf7]/95 px-4 backdrop-blur dark:border-white/10 dark:bg-[#0b1120]/95 sm:px-6 lg:px-8">
        <KotakPencarian
          value={kataKunci}
          onChange={setKataKunci}
          onSubmit={handleCari}
          autoFocus
          inputRef={inputMobileRef}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => {
            setCariMobileTerbuka(false)
            setKataKunci("")
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#16233f] hover:bg-[#efece2] dark:text-white dark:hover:bg-white/10"
          aria-label="Tutup pencarian"
        >
          <IconX className="h-5 w-5" />
        </button>
      </header>
    )
  }

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center gap-3 border-b border-[#e7e4dc] bg-[#fbfaf7]/95 px-4 backdrop-blur dark:border-white/10 dark:bg-[#0b1120]/95 sm:px-6 lg:px-8">
      {/* Tombol menu — hanya di mobile/tablet, membuka drawer sidebar */}
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[#16233f] hover:bg-[#efece2] dark:text-white dark:hover:bg-white/10 lg:hidden"
        aria-label="Buka menu"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      {/* Kotak pencarian — tampil penuh mulai tablet ke atas, mengisi ruang kosong di topbar */}
      <KotakPencarian
        value={kataKunci}
        onChange={setKataKunci}
        onSubmit={handleCari}
        className="hidden max-w-md flex-1 sm:flex"
      />

      <div className="flex flex-1 items-center justify-end gap-3">
        {/* Tombol pencarian ringkas — hanya di mobile, membuka overlay pencarian */}
        <button
          type="button"
          onClick={() => setCariMobileTerbuka(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#16233f] hover:bg-[#efece2] dark:text-white dark:hover:bg-white/10 sm:hidden"
          aria-label="Cari"
        >
          <IconSearch className="h-[18px] w-[18px]" />
        </button>

        <Link
          href="/notifikasi-peserta"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#16233f] hover:bg-[#efece2] dark:text-white dark:hover:bg-white/10"
          aria-label={adaNotifikasiBaru ? `Notifikasi, ${jumlahNotifikasiBelumDibaca} belum dibaca` : "Notifikasi"}
        >
          <IconBell className="h-5 w-5" />
          {adaNotifikasiBaru && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d23b3b] px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-[#fbfaf7] dark:ring-[#0b1120]">
              {labelBadge}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-[#e7e4dc] bg-white py-1 pl-1 pr-2.5 shadow-[0_2px_6px_rgba(22,35,63,0.06)] hover:bg-[#f6f4ec] dark:border-white/10 dark:bg-[#141c30] dark:hover:bg-white/5"
          >
            <AvatarPeserta fotoUrl={user.fotoUrl} nama={user.nama} className="h-7 w-7 ring-1 ring-[#e7e4dc] dark:ring-white/10" />
            <span className="hidden text-[12.5px] font-medium text-[#34435f] dark:text-white/80 sm:inline">
              {namaDepan}
            </span>
            <IconChevronDown className="h-4 w-4 text-[#8b93a6] dark:text-white/40" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-[14px] border border-[#e7e4dc] bg-white p-2 shadow-[0_16px_36px_rgba(22,35,63,0.16)] dark:border-white/10 dark:bg-[#141c30] dark:shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-2.5 border-b border-[#efece4] px-2.5 pb-2.5 pt-1 dark:border-white/10">
                <AvatarPeserta fotoUrl={user.fotoUrl} nama={user.nama} className="h-9 w-9" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#16233f] dark:text-white">{user.nama}</p>
                  <p className="truncate text-[11.5px] text-[#8b93a6] dark:text-white/50">{user.email}</p>
                </div>
              </div>

              <Link
                href="/profil"
                onClick={() => setMenuOpen(false)}
                className="mt-1.5 flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-[#34435f] hover:bg-[#f6f4ec] dark:text-white/80 dark:hover:bg-white/10"
              >
                <IconProfil className="h-4 w-4 text-[#8b93a6] dark:text-white/40" />
                Profil Saya
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-0.5 flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-[#d23b3b] hover:bg-[#fdf1f1] dark:text-red-400 dark:hover:bg-red-400/10"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}