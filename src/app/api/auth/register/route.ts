import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { ZodError } from "zod"

import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth.schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const email = data.email.toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email sudah terdaftar. Gunakan email lain atau masuk ke akun Anda.",
        },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        nama: data.nama.trim(),
        email,
        password: hashedPassword,
        // role tidak dikirim dari client — selalu default PESERTA (lihat schema.prisma)
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { message: "Pendaftaran berhasil.", user },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Data yang dikirim tidak valid.",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    console.error("[REGISTER_ERROR]", error)

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server. Coba lagi." },
      { status: 500 }
    )
  }
}