import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireAdmin, requireGuru } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }

type OpsiInput = {
  id?: string // Opsional: jika ada, berarti update; jika tidak, berarti create
  teks: string
  benar: boolean
}

type SoalInput = {
  id: string
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  poin: number
  opsi?: OpsiInput[]
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: ujianId } = await params
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
  }

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.soal)) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 })
  }

  const soalList = body.soal as SoalInput[]

  // Validasi
  for (const s of soalList) {
    if (!s.id || !s.pertanyaan?.trim()) {
      return NextResponse.json(
        { message: "Setiap soal harus memiliki ID dan pertanyaan." },
        { status: 400 }
      )
    }
    if (typeof s.poin !== "number" || s.poin <= 0) {
      return NextResponse.json(
        { message: "Poin harus berupa angka lebih dari 0." },
        { status: 400 }
      )
    }
    if (s.tipe === "PILIHAN_GANDA") {
      if (!Array.isArray(s.opsi) || s.opsi.length < 2) {
        return NextResponse.json(
          { message: "Soal PG minimal harus punya 2 opsi." },
          { status: 400 }
        )
      }
      const jumlahBenar = s.opsi.filter((o) => o.benar).length
      if (jumlahBenar !== 1) {
        return NextResponse.json(
          { message: "Tepat satu opsi harus ditandai benar di setiap soal PG." },
          { status: 400 }
        )
      }
    }
  }

  try {
    // Pastikan ujian milik guru yang login
    const ujian = await prisma.ujian.findFirst({
      where: { id: ujianId, pembuatId: guard.userId },
      select: { id: true },
    })

    if (!ujian) {
      return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
    }

    // =========================================================
    // 1. UPDATE SOAL & OPSI
    // =========================================================
    await prisma.$transaction(async (tx) => {
      for (const s of soalList) {
        // Update soal
        await tx.soal.update({
          where: { id: s.id },
          data: {
            pertanyaan: s.pertanyaan.trim(),
            tipe: s.tipe,
            poin: s.poin,
          },
        })

        // Handle opsi jika tipe PG
        if (s.tipe === "PILIHAN_GANDA" && s.opsi) {
          // Ambil opsi yang ada di database saat ini
          const opsiLama = await tx.opsi.findMany({
            where: { soalId: s.id },
            select: { id: true },
          })

          const opsiIdsInput = s.opsi.map((o) => o.id).filter(Boolean) as string[]
          
          // Hapus opsi yang tidak ada di input (opsi yang dihapus guru)
          const opsiIdsHapus = opsiLama
            .filter((o) => !opsiIdsInput.includes(o.id))
            .map((o) => o.id)
          
          if (opsiIdsHapus.length > 0) {
            await tx.opsi.deleteMany({
              where: { id: { in: opsiIdsHapus } },
            })
          }

          // Update atau Create opsi
          for (let i = 0; i < s.opsi.length; i++) {
            const o = s.opsi[i]
            if (o.id) {
              // Update opsi yang sudah ada
              await tx.opsi.update({
                where: { id: o.id },
                data: {
                  teks: o.teks.trim(),
                  benar: Boolean(o.benar),
                  urutan: i,
                },
              })
            } else {
              // Create opsi baru (jika guru menambah opsi)
              await tx.opsi.create({
                data: {
                  soalId: s.id,
                  teks: o.teks.trim(),
                  benar: Boolean(o.benar),
                  urutan: i,
                },
              })
            }
          }
        }
      }
    })

    // =========================================================
    // 2. HITUNG ULANG SKOR SEMUA PESERTA
    // =========================================================
    // Ambil semua soal terbaru untuk perhitungan
    const soalTerbaru = await prisma.soal.findMany({
      where: { ujianId },
      include: { opsi: true },
    })

    // Ambil semua hasil ujian peserta yang sudah SELESAI
    const hasilUjianList = await prisma.hasilUjian.findMany({
      where: { ujianId, status: "SELESAI" },
      include: { jawaban: true },
    })

    let jumlahPesertaDiupdate = 0

    for (const hasil of hasilUjianList) {
      let totalPoinDidapat = 0
      let totalPoinMaksimal = 0

      for (const soalItem of soalTerbaru) {
        totalPoinMaksimal += soalItem.poin

        const jawabanPeserta = hasil.jawaban.find((j) => j.soalId === soalItem.id)
        if (!jawabanPeserta) continue

        // Cek apakah jawaban benar
        let benar = false
        if (soalItem.tipe === "PILIHAN_GANDA") {
          const opsiBenar = soalItem.opsi.find((o) => o.benar)
          benar = opsiBenar?.id === jawabanPeserta.opsiPilihan
        } else {
          // Untuk essay, kita asumsikan sudah dinilai manual (benar === true)
          benar = jawabanPeserta.benar === true
        }

        if (benar) {
          totalPoinDidapat += soalItem.poin
        }
      }

      // Hitung skor akhir (skala 0-100)
      const skorAkhir = totalPoinMaksimal > 0 
        ? Math.round((totalPoinDidapat / totalPoinMaksimal) * 100 * 10) / 10 
        : 0

      // Update skor peserta
      await prisma.hasilUjian.update({
        where: { id: hasil.id },
        data: { skor: skorAkhir },
      })
      
      jumlahPesertaDiupdate++
    }

    return NextResponse.json({ 
      message: "Semua soal berhasil diperbarui dan skor peserta telah dihitung ulang.",
      jumlahPesertaDiupdate 
    })

  } catch (error) {
    console.error("Bulk update error:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: `Gagal memperbarui: ${error.code}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { message: "Gagal menyimpan perubahan." },
      { status: 500 }
    )
  }
}