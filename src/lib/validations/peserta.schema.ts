import { z } from "zod"

const nisnSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "NISN harus 10 digit angka")
  .optional()
  .or(z.literal(""))

const noUrutSchema = z
  .union([z.coerce.number().int().positive("No. urut harus angka positif"), z.literal("")])
  .optional()

export const pesertaCreateSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .max(72, "Kata sandi maksimal 72 karakter"),
  nisn: nisnSchema,
  noUrut: noUrutSchema,
})

export const pesertaUpdateSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .toLowerCase(),
  password: z
    .union([z.string().min(6, "Kata sandi minimal 6 karakter").max(72, "Kata sandi maksimal 72 karakter"), z.literal("")])
    .optional(),
  nisn: nisnSchema,
  noUrut: noUrutSchema,
})

export type PesertaCreateInput = z.infer<typeof pesertaCreateSchema>
export type PesertaUpdateInput = z.infer<typeof pesertaUpdateSchema>