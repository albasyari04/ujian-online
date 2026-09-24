import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/* =========================================================
   AKUN YANG AKAN DIBUAT
   Ubah email/password/nama di sini sesuai kebutuhan.
========================================================= */

const ACCOUNTS = [
  {
    nama: "Administrator",
    email: "admin@ujian.sch.id",
    password: "admin123",
    role: Role.ADMIN,
  },
  {
    nama: "yaipu muttaklim",
    email: "yaipu@ujian.sch.id",
    password: "yaipu123",
    role: Role.ADMIN,
  },
  {
    nama: "Contoh Guru",
    email: "guru@ujian.sch.id",
    password: "guru123",
    role: Role.GURU,
  },
  {
    nama: "Siswa Contoh",
    email: "siswa@ujian.sch.id",
    password: "siswa123",
    role: Role.PESERTA,
  },
] as const

async function main() {
  console.log("Memulai seeding...\n")

  for (const account of ACCOUNTS) {
    const hashedPassword = await bcrypt.hash(account.password, 10)

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        nama: account.nama,
        password: hashedPassword,
        role: account.role,
      },
      create: {
        nama: account.nama,
        email: account.email,
        password: hashedPassword,
        role: account.role,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
      },
    })

    console.log(`✔ ${user.role.padEnd(8)} -> ${user.email} (${user.nama})`)
  }

  console.log("\nSeeding selesai. Kredensial login:")
  for (const account of ACCOUNTS) {
    console.log(`  [${account.role}] email: ${account.email} | password: ${account.password}`)
  }
}

main()
  .catch((error) => {
    console.error("Seeding gagal:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })