"use client"

import { useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type Guru = {
  id: string
  nama: string
  email: string
}

type FieldErrors = Partial<Record<"nama" | "email" | "password", string>>

export function FormGuru({
  guru,
  onSuccess,
  onCancel,
}: {
  guru?: Guru
  onSuccess: () => void
  onCancel: () => void
}) {
  const isEdit = Boolean(guru)

  const [nama, setNama] = useState(guru?.nama ?? "")
  const [email, setEmail] = useState(guru?.email ?? "")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    setFormError("")
    setIsSubmitting(true)

    try {
      const response = await fetch(isEdit ? `/api/guru/${guru!.id}` : "/api/guru", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.errors) {
          setErrors({
            nama: result.errors.nama?.[0],
            email: result.errors.email?.[0],
            password: result.errors.password?.[0],
          })
        } else {
          setFormError(result.message ?? "Terjadi kesalahan, coba lagi.")
        }
        return
      }

      onSuccess()
    } catch {
      setFormError("Gagal terhubung ke server. Periksa koneksi Anda.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nama lengkap"
        name="nama"
        placeholder="Contoh: Budi Santoso, S.Pd."
        value={nama}
        onChange={(event) => setNama(event.target.value)}
        error={errors.nama}
        autoFocus
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="guru@sekolah.sch.id"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        required
      />

      <Input
        label={isEdit ? "Kata sandi baru (opsional)" : "Kata sandi"}
        name="password"
        type="password"
        placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint={isEdit ? "Biarkan kosong untuk mempertahankan kata sandi saat ini." : undefined}
        required={!isEdit}
      />

      {formError && (
        <p className="rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b]">
          {formError}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEdit ? "Simpan perubahan" : "Tambah guru"}
        </Button>
      </div>
    </form>
  )
}