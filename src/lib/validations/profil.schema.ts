import { z } from "zod"

export const updateProfilSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  // Boleh kosong (hapus foto) atau URL yang valid.
  fotoUrl: z
    .string()
    .trim()
    .url("URL foto tidak valid")
    .optional()
    .or(z.literal("")),
})

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>

export const changePasswordSchema = z
  .object({
    passwordSaatIni: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    passwordBaru: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    konfirmasiPasswordBaru: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.passwordBaru === data.konfirmasiPasswordBaru, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["konfirmasiPasswordBaru"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>