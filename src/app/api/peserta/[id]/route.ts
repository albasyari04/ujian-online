import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { Prisma, Role } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pesertaUpdateSchema } from "@/lib/validations/peserta.schema"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== "ADMIN") {
    return null
  }

  return session
}

// GET /api/peserta/:id
// Detail peserta beserta seluruh riwayat hasil ujiannya.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const peserta = await prisma.user.findFirst({
    where: { id, role: Role.PESERTA },
    select: {
      id: true,
      nama: true,
      email: true,
      nisn: true,
      noUrut: true,
      createdAt: true,
      hasilUjian: {
        orderBy: { waktuMulai: "desc" },
        select: {
          id: true,
          skor: true,
          status: true,
          waktuMulai: true,
          waktuSelesai: true,
          jumlahPelanggaran: true,
          ujian: { select: { id: true, judul: true, durasiMenit: true } },
        },
      },
    },
  })

  if (!peserta) {
    return NextResponse.json({ message: "Peserta tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json({ peserta })
}

// PUT /api/peserta/:id
// Memperbarui nama, email, NISN, No. Urut, dan (opsional) kata sandi peserta.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = pesertaUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data tidak valid", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const target = await prisma.user.findFirst({ where: { id, role: Role.PESERTA } })
  if (!target) {
    return NextResponse.json({ message: "Peserta tidak ditemukan" }, { status: 404 })
  }

  const { nama, email, password, nisn, noUrut } = parsed.data

  // Cek duplikasi email
  if (email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: { email: ["Email sudah terdaftar"] } },
        { status: 422 }
      )
    }
  }

  // Cek duplikasi NISN (jika diisi dan berbeda dari yang lama)
  if (nisn && nisn !== target.nisn) {
    const existingNisn = await prisma.user.findUnique({ where: { nisn } })
    if (existingNisn) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: { nisn: ["NISN sudah terdaftar"] } },
        { status: 422 }
      )
    }
  }

  // Cek duplikasi No. Urut
  if (noUrut !== undefined && noUrut !== null && noUrut !== target.noUrut) {
    const existingNoUrut = await prisma.user.findUnique({ where: { noUrut } })
    if (existingNoUrut) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: { noUrut: ["No. urut sudah dipakai"] } },
        { status: 422 }
      )
    }
  }

  const data: Prisma.UserUpdateInput = {
    nama,
    email,
    nisn: nisn || null,
    noUrut: noUrut ?? null,
  }
  if (password) {
    data.password = await bcrypt.hash(password, 10)
  }

  const peserta = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      nama: true,
      email: true,
      nisn: true,
      noUrut: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ peserta })
}

// DELETE /api/peserta/:id
// Menghapus akun peserta. Ditolak jika peserta masih memiliki riwayat ujian.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const target = await prisma.user.findFirst({ where: { id, role: Role.PESERTA } })
  if (!target) {
    return NextResponse.json({ message: "Peserta tidak ditemukan" }, { status: 404 })
  }

  try {
    await prisma.user.delete({ where: { id } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "Peserta ini memiliki riwayat ujian sehingga tidak dapat dihapus. Hapus riwayat ujian terkait terlebih dahulu.",
        },
        { status: 409 }
      )
    }
    throw error
  }

  return NextResponse.json({ message: "Peserta berhasil dihapus" })
}