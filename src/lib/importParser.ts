import { BACAAN_START, BACAAN_END, SOAL_START } from "@/lib/bacaan"

export type Option = { teks: string; benar: boolean }
export type Question = {
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  poin: number
  opsi?: Option[]
}

const LABELS = ["A", "B", "C", "D", "E"] as const

export function clean(value: unknown) {
  return String(value ?? "").trim()
}

/* ------------------------------------------------------------------ */
/*  KUNCI JAWABAN                                                      */
/* ------------------------------------------------------------------ */

export function parseAnswer(value: string) {
  const answer = clean(value).toUpperCase().replace(/[.)\],;:]+$/, "")
  const letter = answer.match(/(?:^|[^A-E])([A-E])(?:$|[^A-E])/i)?.[1]
  if (letter) return letter.toUpperCase()
  const number = Number(answer.match(/\b([1-5])\b/)?.[1])
  return Number.isInteger(number) ? String.fromCharCode(64 + number) : ""
}

function extractAnswer(lines: string[]) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const keyMatch = line.match(
      /\b(?:kunci(?:\s+jawaban)?|jawaban(?:\s+(?:yang\s+)?benar)?|answer|ans)\b[^\r\n]*?(?:opsi\s*)?\(?([A-E]|[1-5])\)?\s*$/i
    )
    if (keyMatch) return parseAnswer(keyMatch[1])
    if (/\b(?:kunci(?:\s+jawaban)?|jawaban(?:\s+benar)?|answer|ans)\b\s*[:=\-]?\s*$/i.test(line)) {
      const nextAnswer = lines[index + 1]?.match(/^[(:\-\s]*(?:opsi\s*)?([A-E]|[1-5])(?:\b|\s*\))/i)
      if (nextAnswer) return parseAnswer(nextAnswer[1])
    }
  }
  return ""
}

function extractGlobalAnswers(lines: string[]) {
  const answers = new Map<number, string>()
  for (const line of lines) {
    if (/^(?:[A-Z]\.\s*)?(?:pilihan\s+ganda|essay|uraian|isian|kunci|pedoman|penilaian)\b/i.test(line)) continue

    const numberFirst = [
      ...line.matchAll(
        /(?:^|[\s,;])(\d{1,3})\s*[.):=\-]?\s*(?:jawaban\s*[:=\-]?\s*)?(?:opsi\s*)?\(?([A-E])\)?(?=\s|,|;|$)/gi
      ),
    ]
    for (const match of numberFirst) {
      const num = Number(match[1])
      const ans = parseAnswer(match[2])
      if (num >= 1 && num <= 200 && ans) answers.set(num, ans)
    }

    // PERBAIKAN: format "C1 B2" hanya dipakai jika format "1. C" TIDAK ditemukan di baris yang sama.
    // Sebelumnya kunci satu baris "1. C 2. B 3. A" terbaca ganda dan menimpa jawaban yang benar.
    if (numberFirst.length > 0) continue

    const letterFirst = [...line.matchAll(/(?:^|[\s,;])([A-E])\s*(\d{1,3})\s*[.):=\-]?(?=\s|,|;|$)/gi)]
    for (const match of letterFirst) {
      const num = Number(match[2])
      const ans = parseAnswer(match[1])
      if (num >= 1 && num <= 200 && ans) answers.set(num, ans)
    }
  }

  // Fallback: kunci berupa daftar huruf tanpa nomor (C, B, D, ...) -> urut sesuai nomor soal
  if (answers.size === 0) {
    let seq = 0
    for (const line of lines) {
      const bare = line.match(/^(?:[a-z]\.\s*)?([A-E])$/i)
      if (bare) answers.set(++seq, bare[1].toUpperCase())
    }
  }
  return answers
}

function isAnswerSectionHeader(line: string) {
  return /^(?:kunci\s+jawaban|kunci|daftar\s+jawaban|jawaban|answer\s+key|pedoman\s+penilaian)\b/i.test(line)
}

function isAnswerSubHeader(line: string) {
  return /^(?:[A-Z]\.\s*)?(?:pilihan\s+ganda|essay|uraian|isian)\b/i.test(line)
}

/* ------------------------------------------------------------------ */
/*  PEMBERSIHAN TEKS                                                   */
/* ------------------------------------------------------------------ */

function sanitizeRawText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\u00a0|\u200b/g, " ")
    .replace(/^=+\s*Page\s*\d+\s*=+$/gim, "")
    .replace(/^[-_]{3,}$/gm, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{2,}([^_]+)_{2,}/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\\\s*$/gm, "")
    .replace(/\t+/g, " ")
    .replace(/[ ]{2,}/g, " ")
}

/* ------------------------------------------------------------------ */
/*  OPSI                                                               */
/* ------------------------------------------------------------------ */

/** Cek apakah baris adalah baris opsi A-E */
function isOptionLine(line: string): boolean {
  return /^\(?[A-E]\)?\s*[.)]\s+/i.test(line)
}

/** Cek apakah baris adalah EKOR opsi (baris E.) */
function isLastOptionLine(line: string): boolean {
  return /^\(?E\)?\s*[.)]\s+/i.test(line)
}

/**
 * PERBAIKAN: opsi HANYA dibaca dari baris yang diawali penanda opsi (A. / B) / (C) ...),
 * berurutan A -> E, tanpa duplikat label. Opsi yang ditulis sebaris ("A. x B. y C. z")
 * dipecah hanya jika label berikutnya sesuai urutan.
 *
 * Sebelumnya seluruh baris (termasuk teks pertanyaan) dipindai dengan regex tanpa urutan,
 * sehingga teks seperti "matriks A:" atau "titik B." dianggap opsi dan label menjadi ganda
 * (dua opsi bertanda benar -> server menolak: "harus memiliki tepat 1 jawaban benar").
 */
export function extractOptions(lines: string[]) {
  const options: { label: string; teks: string }[] = []
  let nextIndex = 0

  for (const line of lines) {
    const start = line.match(/^\(?([A-Ea-e])\)?\s*[.)]\s+(.*)$/)
    if (!start) continue

    let labelIndex = LABELS.indexOf(start[1].toUpperCase() as (typeof LABELS)[number])
    if (labelIndex < nextIndex) continue // label mundur/duplikat -> abaikan

    let rest = start[2]
    for (;;) {
      const following = LABELS[labelIndex + 1]
      const inline = following ? new RegExp(`\\s\\(?${following}\\)?[.)]\\s+`).exec(rest) : null
      const teks = (inline ? rest.slice(0, inline.index) : rest).trim()
      if (teks) {
        options.push({
          label: LABELS[labelIndex],
          teks: teks.replace(/^\s*(?:\[x\]|\(benar\)|\*+)\s*/i, ""),
        })
        nextIndex = labelIndex + 1
      }
      if (!inline) break
      rest = rest.slice(inline.index + inline[0].length)
      labelIndex += 1
    }
  }

  return options
}

/* ------------------------------------------------------------------ */
/*  EXCEL / CSV                                                        */
/* ------------------------------------------------------------------ */

export function parseRows(rows: Record<string, unknown>[]): Question[] {
  return rows.map((row, index) => {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key.toLowerCase().replace(/[\s_-]+/g, ""), value])
    )
    const value = (...keys: string[]) =>
      keys.map((key) => normalized[key.replace(/[\s_-]+/g, "").toLowerCase()]).find((item) => clean(item))
    const question = clean(value("pertanyaan", "soal", "question"))
    const type = clean(value("tipe", "type") ?? "PILIHAN_GANDA").toUpperCase()
    const rawPoint = Number(value("poin", "point") ?? 1)
    const point = Number.isFinite(rawPoint) && rawPoint > 0 ? rawPoint : 1
    if (!question) throw new Error(`Baris ${index + 2}: kolom pertanyaan kosong.`)
    if (type === "ESSAY" || type === "URAIAN") return { pertanyaan: question, tipe: "ESSAY", poin: point, opsi: [] }
    const answer = parseAnswer(clean(value("jawaban", "kunci", "answer")))
    const opsi = LABELS.map((label) => ({
      teks: clean(value(`opsi${label}`, label)),
      benar: answer === label,
    })).filter((option) => option.teks)
    if (opsi.length < 2) throw new Error(`Baris ${index + 2}: minimal 2 opsi diperlukan.`)
    if (!answer || !opsi.some((option) => option.benar)) {
      throw new Error(`Baris ${index + 2}: jawaban/kunci A-E wajib diisi dan harus sesuai opsi yang ada.`)
    }
    return { pertanyaan: question, tipe: "PILIHAN_GANDA", poin: point, opsi }
  })
}

/* ------------------------------------------------------------------ */
/*  WORD / PDF / TXT                                                   */
/* ------------------------------------------------------------------ */

/**
 * Deteksi baris HEADER DOKUMEN yang harus dibuang.
 * PENTING: keyword di-anchor dengan \b supaya "Bacalah" tidak match "baca".
 */
function isHeaderLine(line: string): boolean {
  return /^(?:\d+\s*[.)]\s*)?(?:soal\s+ujian|naskah\s+soal|penilaian|ujian|sma\b|smk\b|ma\b|tahun\s+pelajaran|mata\s+pelajaran|kelas\s*\/|hari\s*\/|waktu\s*:|nama\s+siswa|nomor\s+ujian|nama\s*:|kelas\s*:|tanggal\s*:|petunjuk|pilihlah|jawablah|bacaan\s+utama|pilihan\s+ganda)/i.test(
    line
  )
}

/** Baris bacaan = bukan header, bukan opsi, bukan soal ber-nomor. */
function isBacaanLine(line: string): boolean {
  if (!line) return false
  if (isHeaderLine(line)) return false
  if (isOptionLine(line)) return false
  if (/^\d+[.)]\s*/.test(line)) return false
  if (isAnswerSectionHeader(line)) return false
  if (isAnswerSubHeader(line)) return false
  return true
}

export function parseText(rawText: string): Question[] {
  const sanitized = sanitizeRawText(rawText)
  const lines = sanitized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  // --- Tahap 1: Pisahkan section soal dan section kunci jawaban ---
  const soalLines: string[] = []
  const answerLines: string[] = []
  let inAnswerSection = false

  for (const line of lines) {
    if (isAnswerSectionHeader(line)) {
      inAnswerSection = true
      continue
    }
    if (inAnswerSection && isAnswerSubHeader(line)) continue
    if (inAnswerSection) answerLines.push(line)
    else soalLines.push(line)
  }

  const globalAnswers = extractGlobalAnswers(answerLines)

  // --- Tahap 2: Bagi soalLines menjadi blok-blok ---
  type RawBlock = {
    bacaan: string
    soal: string
    blockLines: string[]
    opsi: { label: string; teks: string }[]
    questionNumber: number | null
  }
  const rawBlocks: RawBlock[] = []

  let pendingBacaan: string[] = []
  let currentBlock: { lines: string[] } | null = null
  let sudahPernahKetemuSoal = false

  const simpanBlokSekarang = () => {
    if (!currentBlock) return
    const blockLines = currentBlock.lines
    if (blockLines.length === 0) {
      currentBlock = null
      return
    }

    const firstOptionIndex = blockLines.findIndex((l) => isOptionLine(l))
    const hasOptions = firstOptionIndex >= 0

    // Teks soal = semua baris SEBELUM opsi pertama (mendukung soal multi-baris).
    // Soal tanpa opsi (essay) hanya memakai baris pertama agar bacaan soal berikutnya tidak ikut terbawa.
    const questionLines = hasOptions ? blockLines.slice(0, firstOptionIndex) : [blockLines[0]]
    const optionLines = hasOptions ? blockLines.slice(firstOptionIndex) : []

    const nomorMatch = (questionLines[0] ?? "").match(/^(\d+)[.)]\s*/)
    const questionNumber = nomorMatch ? Number(nomorMatch[1]) : null
    const firstLine = (questionLines[0] ?? "").replace(/^(\d+[.)]|soal\s*\d*[:.)]?)\s*/i, "").trim()
    const pertanyaan = [firstLine, ...questionLines.slice(1)].join(" ").trim()

    const opsi = extractOptions(optionLines)

    const bacaanTeks = pendingBacaan
      .filter((l) => isBacaanLine(l))
      .join("\n")
      .trim()

    rawBlocks.push({ bacaan: bacaanTeks, soal: pertanyaan, blockLines, opsi, questionNumber })

    pendingBacaan = []
    currentBlock = null
  }

  for (const line of soalLines) {
    if (!sudahPernahKetemuSoal && isHeaderLine(line)) continue

    if (isOptionLine(line)) {
      if (!currentBlock) currentBlock = { lines: [] }
      currentBlock.lines.push(line)
      if (isLastOptionLine(line)) {
        simpanBlokSekarang()
        sudahPernahKetemuSoal = true
      }
      continue
    }

    if (currentBlock) {
      const diawaliAngka = /^\d+[.)]\s*/i.test(line)
      if (diawaliAngka) {
        simpanBlokSekarang()
        currentBlock = { lines: [line] }
      } else {
        currentBlock.lines.push(line)
      }
      continue
    }

    const diawaliAngka = /^\d+[.)]\s*/i.test(line)
    if (diawaliAngka) {
      currentBlock = { lines: [line] }
    } else if (isBacaanLine(line)) {
      pendingBacaan.push(line)
    }
  }

  simpanBlokSekarang()

  // --- Tahap 3: Bangun Question dari rawBlocks ---
  const questions: Question[] = []
  let soalCounter = 0

  for (const blok of rawBlocks) {
    if (!blok.soal) continue

    soalCounter += 1

    const answer =
      (blok.questionNumber ? globalAnswers.get(blok.questionNumber) : "") ||
      globalAnswers.get(soalCounter) ||
      extractAnswer(blok.blockLines) ||
      ""

    const finalQuestion = blok.bacaan
      ? `${BACAAN_START}\n${blok.bacaan}\n${BACAAN_END}\n${SOAL_START}\n${blok.soal}`
      : blok.soal

    if (blok.opsi.length === 0) {
      questions.push({ pertanyaan: finalQuestion, tipe: "ESSAY", poin: 1, opsi: [] })
      continue
    }

    // PERBAIKAN: kunci tidak ditemukan / tidak cocok dengan opsi TIDAK lagi menggagalkan seluruh file.
    // Soal tetap masuk pratinjau (tanpa kunci) dan guru memilih jawaban benar langsung di pratinjau.
    questions.push({
      pertanyaan: finalQuestion,
      tipe: "PILIHAN_GANDA",
      poin: 1,
      opsi: blok.opsi.map((option) => ({ teks: option.teks, benar: option.label === answer })),
    })
  }

  return questions
}

/* ------------------------------------------------------------------ */
/*  VALIDASI (cerminan aturan server)                                  */
/* ------------------------------------------------------------------ */

/** Mengembalikan daftar masalah per soal. Kosong = aman untuk diimpor. */
export function validateQuestions(questions: Question[]): { index: number; message: string }[] {
  const issues: { index: number; message: string }[] = []
  questions.forEach((q, index) => {
    const no = index + 1
    if (!clean(q.pertanyaan)) issues.push({ index, message: `Soal ke-${no}: teks pertanyaan kosong.` })
    if (!Number.isFinite(q.poin) || q.poin <= 0) issues.push({ index, message: `Soal ke-${no}: poin harus lebih dari 0.` })
    if (q.tipe !== "PILIHAN_GANDA") return

    const opsi = q.opsi ?? []
    if (opsi.length < 2) {
      issues.push({ index, message: `Soal ke-${no}: hanya ${opsi.length} opsi terbaca (minimal 2).` })
    }
    const jumlahBenar = opsi.filter((o) => o.benar).length
    if (jumlahBenar !== 1) {
      issues.push({
        index,
        message:
          jumlahBenar === 0
            ? `Soal ke-${no}: kunci jawaban belum dipilih.`
            : `Soal ke-${no}: ada ${jumlahBenar} jawaban benar (harus tepat 1).`,
      })
    }
  })
  return issues
}