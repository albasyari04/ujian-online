"use client"

import { useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export function ProfilForm({ user }: { user: { nama: string; email: string; fotoUrl: string | null } }) {
  const { update } = useSession()
  const [nama, setNama] = useState(user.nama)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState("")
  const [fotoUrl, setFotoUrl] = useState(user.fotoUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [sukses, setSukses] = useState(false)

  async function simpan() {
    setSaving(true)
    setError("")
    setSukses(false)

    try {
      const res = await fetch("/api/guru/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password: password || undefined, fotoUrl: fotoUrl || null }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? "Gagal menyimpan profil")
        return
      }

      await update({ name: json.data.nama, email: json.data.email, fotoUrl: json.data.fotoUrl })
      setPassword("")
      setSukses(true)
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="max-w-xl p-5">
      <div className="flex items-center gap-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#e7e4dc] ring-4 ring-[#eef2ff] dark:bg-white/10 dark:ring-white/10">
          <Image
            src={fotoUrl.trim() !== "" ? fotoUrl : "/image/icon/user-icon.png"}
            alt={nama}
            fill
            sizes="64px"
            className="object-cover"
          />
        </span>
        <div>
          <p className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">{nama}</p>
          <p className="text-[12px] text-[#8b93a6] dark:text-white/40">{email}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        {error && (
          <p className="rounded-[10px] bg-[#fdf1f1] px-3 py-2 text-[12.5px] text-[#d23b3b] dark:bg-red-500/10">
            {error}
          </p>
        )}
        {sukses && (
          <p className="rounded-[10px] bg-[#ecfdf5] px-3 py-2 text-[12.5px] text-[#047857] dark:bg-emerald-400/10 dark:text-emerald-300">
            Profil berhasil diperbarui.
          </p>
        )}

        <div>
          <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Nama Lengkap</label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2.5 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div>
          <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2.5 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div>
          <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">
            URL Foto Profil (opsional)
          </label>
          <input
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2.5 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div>
          <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">
            Kata Sandi Baru (kosongkan jika tidak diganti)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-[10px] border border-[#e7e4dc] px-3 py-2.5 text-[13px] focus:border-[#818cf8] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={simpan} isLoading={saving}>
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </Card>
  )
}
