"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function HapusButton({
  url,
  konfirmasi,
  label = "Hapus",
  className,
}: {
  url: string
  konfirmasi: string
  label?: string
  className?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleHapus() {
    if (!window.confirm(konfirmasi)) return

    setLoading(true)
    try {
      const res = await fetch(url, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        window.alert(data?.message ?? "Gagal menghapus data.")
        return
      }

      router.refresh()
    } catch {
      window.alert("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleHapus}
      disabled={loading}
      className={
        className ??
        "rounded-[8px] px-2.5 py-1.5 text-[12.5px] font-medium text-[#d23b3b] hover:bg-[#fdf1f1] disabled:opacity-50"
      }
    >
      {loading ? "Menghapus..." : label}
    </button>
  )
}