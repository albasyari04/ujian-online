import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, requireGuru } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id: ujianId } = await params
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
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

    // 1. Ambil semua soal & opsi terbaru
    const soalTerbaru = await prisma.soal.findMany({
      where: { ujianId },
      include: { opsi: true },
    })

    // 2. Ambil semua hasil ujian peserta yang sudah SELESAI
    const hasilUjianList = await prisma.hasilUjian.findMany({
      where: { ujianId, status: "SELESAI" },
      include: { jawaban: true },
    })

    let jumlahPesertaDiperbaiki = 0

    for (const hasil of hasilUjianList) {
      let totalPoinDidapat = 0
      let totalPoinMaksimal = 0

      for (const soalItem of soalTerbaru) {
        totalPoinMaksimal += soalItem.poin

        const jawabanPeserta = hasil.jawaban.find((j) => j.soalId === soalItem.id)
        if (!jawabanPeserta) continue

        let benar = false

        if (soalItem.tipe === "PILIHAN_GANDA") {
          const opsiBenar = soalItem.opsi.find((o) => o.benar)
          if (!opsiBenar) continue

          // STRATEGI PERBAIKAN: Cocokkan berdasarkan ID ATAU Teks
          // 1. Coba cocokkan berdasarkan ID (jika data masih bagus)
          if (jawabanPeserta.opsiPilihan === opsiBenar.id) {
            benar = true
          } 
          // 2. Jika gagal, coba cocokkan berdasarkan TEKS jawaban
          // (Ini menyelamatkan data yang ID opsinya sudah berubah)
          else {
            // Cari opsi yang teksnya sama dengan jawaban peserta
            const opsiYangDipilihPeserta = soalItem.opsi.find(
              (o) => o.teks.trim().toLowerCase() === jawabanPeserta.opsiPilihan?.trim().toLowerCase()
            )
            // Jika opsi yang dipilih peserta adalah opsi yang benar
            if (opsiYangDipilihPeserta?.id === opsiBenar.id) {
              benar = true
            }
          }
        } else {
          // Untuk essay, asumsikan sudah dinilai manual
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
      
      jumlahPesertaDiperbaiki++
    }

    return NextResponse.json({ 
      message: `Berhasil memperbaiki skor ${jumlahPesertaDiperbaiki} peserta.`,
      jumlahPesertaDiperbaiki 
    })

  } catch (error) {
    console.error("Repair skor error:", error)
    return NextResponse.json(
      { message: "Gagal memperbaiki skor." },
      { status: 500 }
    )
  }
}