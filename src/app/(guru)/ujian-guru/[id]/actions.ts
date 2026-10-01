"use server"

import { revalidatePath } from "next/cache"
import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"

export async function repairSkorUjian(ujianId: string) {
  const guru = await requireGuruSession()

  // Pastikan ujian milik guru yang login
  const ujian = await prisma.ujian.findFirst({
    where: { id: ujianId, pembuatId: guru.user.id },
    select: { id: true },
  })

  if (!ujian) {
    return { success: false, message: "Ujian tidak ditemukan atau bukan milik Anda." }
  }

  try {
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

          // Cocokkan berdasarkan ID ATAU Teks (untuk data lama yang rusak)
          if (jawabanPeserta.opsiPilihan === opsiBenar.id) {
            benar = true
          } else {
            const opsiYangDipilihPeserta = soalItem.opsi.find(
              (o) =>
                o.teks.trim().toLowerCase() ===
                jawabanPeserta.opsiPilihan?.trim().toLowerCase()
            )
            if (opsiYangDipilihPeserta?.id === opsiBenar.id) {
              benar = true
            }
          }
        } else {
          benar = jawabanPeserta.benar === true
        }

        if (benar) {
          totalPoinDidapat += soalItem.poin
        }
      }

      const skorAkhir =
        totalPoinMaksimal > 0
          ? Math.round((totalPoinDidapat / totalPoinMaksimal) * 100 * 10) / 10
          : 0

      await prisma.hasilUjian.update({
        where: { id: hasil.id },
        data: { skor: skorAkhir },
      })

      jumlahPesertaDiperbaiki++
    }

    // Refresh halaman agar skor terbaru langsung tampil
    revalidatePath(`/hasil-guru/${ujianId}`)
    revalidatePath(`/hasil-guru`)

    return {
      success: true,
      message: `Berhasil memperbaiki skor ${jumlahPesertaDiperbaiki} peserta.`,
    }
  } catch (error) {
    console.error("Repair skor error:", error)
    return { success: false, message: "Gagal memperbaiki skor." }
  }
}