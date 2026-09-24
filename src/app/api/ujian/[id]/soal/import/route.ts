import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"


type ImportedOption = { teks: string; benar: boolean }
type ImportedQuestion = { pertanyaan: string; tipe: "PILIHAN_GANDA" | "ESSAY"; poin: number; opsi?: ImportedOption[] }

function validateQuestion(value: unknown, index: number): ImportedQuestion {
  if (!value || typeof value !== "object") throw new Error(`Soal ke-${index + 1} tidak valid.`)
  const item = value as Partial<ImportedQuestion>
  const pertanyaan = typeof item.pertanyaan === "string" ? item.pertanyaan.trim() : ""
  const tipe = item.tipe === "ESSAY" ? "ESSAY" : item.tipe === "PILIHAN_GANDA" ? "PILIHAN_GANDA" : null
  const poin = Number(item.poin)
  if (!pertanyaan) throw new Error(`Pertanyaan soal ke-${index + 1} wajib diisi.`)
  if (!tipe) throw new Error(`Tipe soal ke-${index + 1} tidak valid.`)
  if (!Number.isFinite(poin) || poin <= 0) throw new Error(`Poin soal ke-${index + 1} harus lebih dari 0.`)

  if (tipe === "ESSAY") return { pertanyaan, tipe, poin, opsi: [] }

  const opsi = Array.isArray(item.opsi)
    ? item.opsi.filter((option) => option && typeof option.teks === "string" && option.teks.trim())
        .map((option) => ({ teks: option.teks.trim(), benar: Boolean(option.benar) }))
    : []
  if (opsi.length < 2) throw new Error(`Soal pilihan ganda ke-${index + 1} minimal memiliki 2 opsi.`)
  if (opsi.filter((option) => option.benar).length !== 1) throw new Error(`Soal ke-${index + 1} harus memiliki tepat 1 jawaban benar.`)
  return { pertanyaan, tipe, poin, opsi }
}

export async function POST(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/")[3]
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
    }

    const ujian = await prisma.ujian.findUnique({
      where: { id },
      select: { id: true, pembuatId: true },
    })
    if (!ujian) return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })

    const user = session.user as { id: string; role?: string }
    const isAdmin = user.role === "ADMIN"
    const isPembuat = ujian.pembuatId === user.id

    if (!isAdmin && !isPembuat) {
      return NextResponse.json({ message: "Anda tidak memiliki akses ke resource ini." }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const rawQuestions = body && typeof body === "object" && "soal" in body ? (body as { soal?: unknown }).soal : null
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      return NextResponse.json({ message: "Tidak ada soal untuk diimpor." }, { status: 400 })
    }
    if (rawQuestions.length > 500) return NextResponse.json({ message: "Maksimal 500 soal per impor." }, { status: 400 })

    const questions = rawQuestions.map(validateQuestion)
    const last = await prisma.soal.aggregate({ where: { ujianId: id }, _max: { urutan: true } })
    const startOrder = (last._max.urutan ?? 0) + 1
    await prisma.$transaction(
      questions.map((question, index) => prisma.soal.create({
        data: {
          pertanyaan: question.pertanyaan,
          tipe: question.tipe,
          poin: question.poin,
          urutan: startOrder + index,
          ujianId: id,
          opsi: question.tipe === "PILIHAN_GANDA" ? { create: question.opsi!.map((option, optionIndex) => ({ ...option, urutan: optionIndex })) } : undefined,
        },
      }))
    )
    return NextResponse.json({ imported: questions.length }, { status: 201 })
  } catch (error) {
    console.error("Gagal mengimpor soal:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "Format soal tidak valid." }, { status: 400 })
  }
}