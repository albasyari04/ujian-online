import { z } from "zod"

export const guruCreateSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter"),
})

// Saat edit, password boleh kosong (artinya: tidak diganti).
export const guruUpdateSchema = guruCreateSchema.extend({
  password: z
    .union([z.string().min(6, "Kata sandi minimal 6 karakter"), z.literal("")])
    .optional(),
})

export type GuruCreateInput = z.infer<typeof guruCreateSchema>
export type GuruUpdateInput = z.infer<typeof guruUpdateSchema>