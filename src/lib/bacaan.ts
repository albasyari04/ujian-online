/* =========================================================
   MARKER BACAAN
   Disimpan di dalam field "pertanyaan" dengan format:
     [BACAAN]
     ...teks bacaan...
     [/BACAAN]
     [SOAL]
     ...pertanyaan...
   Ini aman tanpa ubah schema database.
========================================================= */
export const BACAAN_START = "[BACAAN]"
export const BACAAN_END = "[/BACAAN]"
export const SOAL_START = "[SOAL]"

/**
 * Pisahkan bacaan & soal dari field "pertanyaan".
 * - Jika tidak ada marker, kembalikan bacaan = null.
 * - Jika marker tidak lengkap, fallback ke pertanyaan utuh.
 */
export function splitBacaanDanSoal(pertanyaan: string): { bacaan: string | null; soal: string } {
  if (!pertanyaan.includes(BACAAN_START)) return { bacaan: null, soal: pertanyaan }

  const startIdx = pertanyaan.indexOf(BACAAN_START)
  const endIdx = pertanyaan.indexOf(BACAAN_END)
  const soalIdx = pertanyaan.indexOf(SOAL_START)

  if (endIdx === -1) return { bacaan: null, soal: pertanyaan }

  const bacaan = pertanyaan.slice(startIdx + BACAAN_START.length, endIdx).trim()
  const soal =
    soalIdx !== -1
      ? pertanyaan.slice(soalIdx + SOAL_START.length).trim()
      : pertanyaan.slice(endIdx + BACAAN_END.length).trim()

  return { bacaan: bacaan || null, soal }
}