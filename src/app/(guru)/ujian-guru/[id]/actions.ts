"use server"

import { revalidatePath } from "next/cache"
import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"

/** Normalisasi teks: lowercase, hapus spasi berlebih, hapus tanda baca di ujung */
function normalisasiTeks(teks: string | null | undefined): string {
  if (!teks) return ""
  return teks
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // spasi berlebih jadi satu
    .replace(/[.,;:!?'"()\[\]{}]/g, "") // hapus tanda baca
    .trim()
}

export async function repairSkorUjian(ujianId: string) {
  const guru = await requireGuruSession()

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
    let jumlahJawabanCocok = 0
    let jumlahJawabanTidakCocok = 0

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

          const jawabanPesertaRaw = jawabanPeserta.opsiPilihan

          // STRATEGI 1: Cocokkan berdasarkan ID (jika data masih bagus)
          if (jawabanPesertaRaw === opsiBenar.id) {
            benar = true
            jumlahJawabanCocok++
          } else {
            // STRATEGI 2: Cocokkan berdasarkan TEKS (dengan normalisasi)
            const teksJawabanPeserta = normalisasiTeks(jawabanPesertaRaw)
            const teksOpsiBenar = normalisasiTeks(opsiBenar.teks)
            const teksOpsiPeserta = normalisasiTeks(
              soalItem.opsi.find((o) => o.id === jawabanPesertaRaw)?.teks
            )

            if (teksJawabanPeserta === teksOpsiBenar) {
              benar = true
              jumlahJawabanCocok++
            } else if (teksOpsiPeserta === teksOpsiBenar) {
              benar = true
              jumlahJawabanCocok++
            } else {
              // STRATEGI 3: Cocokkan berdasarkan huruf depan (A, B, C, D, E)
              // Jika jawaban peserta adalah "A", "B", dll.
              const hurufJawaban = jawabanPesertaRaw?.trim().toUpperCase()
              if (hurufJawaban && hurufJawaban.length === 1 && /^[A-E]$/.test(hurufJawaban)) {
                const indexBenar = soalItem.opsi.findIndex((o) => o.benar)
                const hurufBenar = String.fromCharCode(65 + indexBenar) // A=65
                if (hurufJawaban === hurufBenar) {
                  benar = true
                  jumlahJawabanCocok++
                }
              } else {
                jumlahJawabanTidakCocok++
              }
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

    revalidatePath(`/ujian-guru/${ujianId}`)
    revalidatePath(`/hasil-guru/${ujianId}`)
    revalidatePath(`/hasil-guru`)

    return {
      success: true,
      message: `Berhasil memperbaiki skor ${jumlahPesertaDiperbaiki} peserta. Jawaban cocok: ${jumlahJawabanCocok}, tidak cocok: ${jumlahJawabanTidakCocok}.`,
    }
  } catch (error) {
    console.error("Repair skor error:", error)
    return { success: false, message: "Gagal memperbaiki skor." }
  }
}