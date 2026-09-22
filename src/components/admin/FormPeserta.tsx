"use client"

import { useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type Peserta = {
  id: string
  nama: string
  email: string
  nisn?: string | null
  noUrut?: number | null
}

type FieldErrors = Partial<
  Record<"nama" | "email" | "password" | "nisn" | "noUrut", string>
>

export function FormPeserta({
  peserta,
  onSuccess,
  onCancel,
}: {
  peserta?: Peserta
  onSuccess: () => void
  onCancel: () => void
}) {
  const isEdit = Boolean(peserta)

  const [nama, setNama] = useState(peserta?.nama ?? "")
  const [email, setEmail] = useState(peserta?.email ?? "")
  const [nisn, setNisn] = useState(peserta?.nisn ?? "")
  const [noUrut, setNoUrut] = useState(
    peserta?.noUrut !== null && peserta?.noUrut !== undefined
      ? String(peserta.noUrut)
      : ""
  )
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
      const response = await fetch(isEdit ? `/api/peserta/${peserta!.id}` : "/api/peserta", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          email,
          password,
          nisn: nisn.trim(),
          noUrut: noUrut.trim() === "" ? "" : Number(noUrut),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.errors) {
          setErrors({
            nama: result.errors.nama?.[0],
            email: result.errors.email?.[0],
            password: result.errors.password?.[0],
            nisn: result.errors.nisn?.[0],
            noUrut: result.errors.noUrut?.[0],
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
        placeholder="Contoh: Budi Santoso"
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
        placeholder="nama@sekolah.sch.id"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="NISN"
          name="nisn"
          inputMode="numeric"
          placeholder="10 digit angka"
          value={nisn}
          onChange={(event) => setNisn(event.target.value.replace(/\D/g, "").slice(0, 10))}
          error={errors.nisn}
          hint="Opsional. Akan tampil di kartu ujian."
        />

        <Input
          label="No. Urut"
          name="noUrut"
          inputMode="numeric"
          placeholder="Contoh: 1"
          value={noUrut}
          onChange={(event) => setNoUrut(event.target.value.replace(/\D/g, ""))}
          error={errors.noUrut}
          hint="Opsional. Digunakan untuk urutan di kartu ujian."
        />
      </div>

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
          {isEdit ? "Simpan perubahan" : "Tambah peserta"}
        </Button>
      </div>
    </form>
  )
}