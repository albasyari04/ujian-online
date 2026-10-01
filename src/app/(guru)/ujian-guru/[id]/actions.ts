"use server"

import { revalidatePath } from "next/cache"
import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"

export async function repairSkorUjian(ujianId: string) {
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findFirst({
    where: { id: ujianId, pembuatId: guru.user.id },
    select: { id: true },
  })

  if (!ujian) {
    return { success: false, message: "Ujian tidak ditemukan atau bukan milik Anda.", debug: [] }
  }

  try {
    // Ambil total soal untuk hitung poin maksimal
    const soalTerbaru = await prisma.soal.findMany({
      where: { ujianId },
      select: { id: true, poin: true, tipe: true },
    })

    const totalPoinMaksimal = soalTerbaru.reduce((sum, s) => sum + s.poin, 0)

    // Ambil semua hasil ujian peserta yang sudah SELESAI, beserta jawabannya
    const hasilUjianList = await prisma.hasilUjian.findMany({
      where: { ujianId, status: "SELESAI" },
      include: { jawaban: true },
    })

    let jumlahPesertaDiperbaiki = 0
    const debug: string[] = []

    debug.push(`Total soal: ${soalTerbaru.length}`)
    debug.push(`Total poin maksimal: ${totalPoinMaksimal}`)
    debug.push(`Total peserta: ${hasilUjianList.length}`)

    for (const hasil of hasilUjianList) {
      let totalPoinDidapat = 0

      for (const soalItem of soalTerbaru) {
        const jawabanPeserta = hasil.jawaban.find((j) => j.soalId === soalItem.id)
        if (!jawabanPeserta) continue

        // GUNAKAN FIELD "benar" yang sudah tersimpan
        // benar = true (1) → dapat poin penuh
        // benar = false (0) → 0 poin
        // benar = null → belum dinilai (anggap 0)
        if (jawabanPeserta.benar === true) {
          totalPoinDidapat += soalItem.poin
        }
      }

      // Hitung skor akhir (skala 0-100)
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

    revalidatePath(`/ujian-guru/${ujianId}`)
    revalidatePath(`/hasil-guru/${ujianId}`)
    revalidatePath(`/hasil-guru`)

    return {
      success: true,
      message: `Berhasil memperbaiki skor ${jumlahPesertaDiperbaiki} peserta.`,
      debug,
    }
  } catch (error) {
    console.error("Repair skor error:", error)
    return { success: false, message: "Gagal: " + (error as Error).message, debug: [] }
  }
}