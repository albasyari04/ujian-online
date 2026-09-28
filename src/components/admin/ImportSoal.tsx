"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { BACAAN_START, BACAAN_END, SOAL_START, splitBacaanDanSoal } from "@/lib/bacaan"
import { docxToText } from "@/lib/docxToText"

export { BACAAN_START, BACAAN_END, SOAL_START, splitBacaanDanSoal }

type Option = { teks: string; benar: boolean }
type Question = { pertanyaan: string; tipe: "PILIHAN_GANDA" | "ESSAY"; poin: number; opsi?: Option[] }

function clean(value: unknown) {
  return String(value ?? "").trim()
}

async function readApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  const body = await response.text()

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(body) as { message?: string; soal?: Question[] }
    } catch {
      throw new Error(`Server mengembalikan JSON yang tidak valid (HTTP ${response.status}).`)
    }
  }

  throw new Error(
    response.ok
      ? "Server mengembalikan respons yang tidak valid."
      : `Import gagal (HTTP ${response.status}). Server mengembalikan halaman HTML, bukan JSON.`
  )
}

function parseAnswer(value: string) {
  const answer = clean(value).toUpperCase().replace(/[.)\],;:]+$/, "")
  const letter = answer.match(/(?:^|[^A-E])([A-E])(?:$|[^A-E])/i)?.[1]
  if (letter) return letter.toUpperCase()
  const number = Number(answer.match(/\b([1-5])\b/)?.[1])
  return Number.isInteger(number) ? String.fromCharCode(64 + number) : ""
}

function extractAnswer(lines: string[]) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const keyMatch = line.match(/\b(?:kunci(?:\s+jawaban)?|jawaban(?:\s+(?:yang\s+)?benar)?|answer|ans)\b[^\r\n]*?(?:opsi\s*)?\(?([A-E]|[1-5])\)?\s*$/i)
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

    const numberFirst = [...line.matchAll(/(?:^|[\s,;])(\d{1,3})\s*[.):=\-]?\s*(?:jawaban\s*[:=\-]?\s*)?(?:opsi\s*)?\(?([A-E])\)?(?=\s|,|;|$)/gi)]
    for (const match of numberFirst) {
      const num = Number(match[1])
      const ans = parseAnswer(match[2])
      if (num >= 1 && num <= 200 && ans) answers.set(num, ans)
    }

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

function extractOptions(lines: string[]) {
  const optionPattern = /(?:^|[\s])(?:\(?)([A-E])(?:\)?\s*[.)]|\)?\s*[-:])\s*/gi
  const options: { label: string; teks: string }[] = []

  for (const line of lines) {
    const matches = [...line.matchAll(optionPattern)]
    if (matches.length === 0) continue
    for (const [matchIndex, match] of matches.entries()) {
      const start = (match.index ?? 0) + match[0].length
      const end = matches[matchIndex + 1]?.index ?? line.length
      const teks = line.slice(start, end).trim()
      if (teks) options.push({ label: match[1].toUpperCase(), teks: teks.replace(/^\s*(?:\[x\]|\(benar\)|\*+)\s*/i, "") })
    }
  }

  return options
}

function parseRows(rows: Record<string, unknown>[]): Question[] {
  return rows.map((row, index) => {
    const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().replace(/[\s_-]+/g, ""), value]))
    const value = (...keys: string[]) => keys.map((key) => normalized[key.replace(/[\s_-]+/g, "").toLowerCase()]).find((item) => clean(item))
    const question = clean(value("pertanyaan", "soal", "question"))
    const type = clean(value("tipe", "type") ?? "PILIHAN_GANDA").toUpperCase()
    const point = Number(value("poin", "point") ?? 1)
    if (!question) throw new Error(`Baris ${index + 2}: kolom pertanyaan kosong.`)
    if (type === "ESSAY") return { pertanyaan: question, tipe: "ESSAY", poin: point, opsi: [] }
    const labels = ["A", "B", "C", "D", "E"]
    const answer = parseAnswer(clean(value("jawaban", "kunci", "answer")))
    const opsi = labels.map((label) => ({ teks: clean(value(`opsi${label}`, label)), benar: answer === label })).filter((option) => option.teks)
    if (opsi.length < 2) throw new Error(`Baris ${index + 2}: minimal 2 opsi diperlukan.`)
    if (!answer || !opsi.some((option) => option.benar)) throw new Error(`Baris ${index + 2}: jawaban/kunci A-E wajib diisi.`)
    return { pertanyaan: question, tipe: "PILIHAN_GANDA", poin: point, opsi }
  })
}

/** Cek apakah baris adalah baris opsi A-E */
function isOptionLine(line: string): boolean {
  return /^\(?[A-E]\)?\s*[.)]\s+/i.test(line)
}

/** Cek apakah baris adalah EKOR opsi (baris E.) */
function isLastOptionLine(line: string): boolean {
  return /^\(?E\)?\s*[.)]\s+/i.test(line)
}

/**
 * Deteksi baris HEADER DOKUMEN yang harus dibuang.
 * PENTING: keyword di-anchor dengan \b supaya "Bacalah" tidak match "baca".
 */
function isHeaderLine(line: string): boolean {
  return /^(?:\d+\s*[.)]\s*)?(?:soal\s+ujian|naskah\s+soal|penilaian|ujian|sma\b|smk\b|ma\b|tahun\s+pelajaran|mata\s+pelajaran|kelas\s*\/|hari\s*\/|waktu\s*:|nama\s+siswa|nomor\s+ujian|nama\s*:|kelas\s*:|tanggal\s*:|petunjuk|pilihlah|jawablah|bacaan\s+utama|pilihan\s+ganda)/i.test(line)
}

/**
 * Deteksi baris BACAAN.
 * Baris bacaan = bukan header, bukan opsi, bukan soal ber-nomor.
 * Termasuk: "Bacalah paragraf cerita...", "Pak Seno menatap...", dsb.
 */
function isBacaanLine(line: string): boolean {
  if (!line) return false
  if (isHeaderLine(line)) return false
  if (isOptionLine(line)) return false
  if (/^\d+[.)]\s*/.test(line)) return false
  if (isAnswerSectionHeader(line)) return false
  if (isAnswerSubHeader(line)) return false
  return true
}

function parseText(rawText: string): Question[] {
  const sanitized = sanitizeRawText(rawText)
  const lines = sanitized.split("\n").map((line) => line.trim()).filter(Boolean)

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

  // --- Tahap 2: Bagi soalLines menjadi blok-blok berdasarkan opsi E ---
  type RawBlock = { bacaan: string; soal: string; blockLines: string[]; opsi: { label: string; teks: string }[]; questionNumber: number | null }
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

    let questionLine = blockLines[0]
    let questionIdx = 0
    for (let i = 0; i < blockLines.length; i += 1) {
      if (!isOptionLine(blockLines[i])) {
        questionLine = blockLines[i]
        questionIdx = i
        break
      }
    }

    const nomorMatch = questionLine.match(/^(\d+)[.)]\s*/)
    const questionNumber = nomorMatch ? Number(nomorMatch[1]) : null
    const pertanyaan = questionLine.replace(/^(\d+[.)]|soal\s*\d*[:.)]?)\s*/i, "").trim()

    const opsi = extractOptions(blockLines.slice(questionIdx))

    // Filter bacaan: hanya baris yang benar-benar bacaan (bukan header/opsi)
    const bacaanTeks = pendingBacaan
      .filter((l) => isBacaanLine(l))
      .join("\n")
      .trim()

    rawBlocks.push({
      bacaan: bacaanTeks,
      soal: pertanyaan,
      blockLines,
      opsi,
      questionNumber,
    })

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
    } else {
      if (isBacaanLine(line)) pendingBacaan.push(line)
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

    if (blok.opsi.length < 2) {
      throw new Error(
        `Soal ke-${soalCounter} ("${blok.soal.slice(0, 50)}..."): hanya ${blok.opsi.length} opsi terbaca.`
      )
    }

    if (!answer) {
      throw new Error(
        `Soal ke-${soalCounter} ("${blok.soal.slice(0, 50)}..."): kunci jawaban tidak ditemukan. ` +
          `Pastikan ada bagian "KUNCI JAWABAN" di akhir dokumen.`
      )
    }

    questions.push({
      pertanyaan: finalQuestion,
      tipe: "PILIHAN_GANDA",
      poin: 1,
      opsi: blok.opsi.map((option) => ({ teks: option.teks, benar: option.label === answer })),
    })
  }

  return questions
}

async function parseFile(file: File, ujianId: string): Promise<Question[]> {
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (extension === "xlsx" || extension === "xls" || extension === "csv") {
    const XLSX = await import("xlsx")
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return parseRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }))
  }
  if (extension === "docx") {
    // Jangan pakai mammoth.extractRawText: penomoran otomatis Word (1. / A.) ikut hilang.
    return parseText(await docxToText(await file.arrayBuffer()))
  }
  if (extension === "pdf") {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch(`/api/ujian/${ujianId}/soal/import/parse`, {
      method: "POST",
      body: formData,
    })
    const result = await readApiResponse(response)
    if (!response.ok) throw new Error(result.message ?? "PDF tidak dapat dibaca.")
    return (result.soal ?? []) as Question[]
  }
  if (extension === "txt") return parseText(await file.text())
  throw new Error("Format tidak didukung. Gunakan .docx, .xlsx, .xls, .csv, .pdf, atau .txt.")
}

export function ImportSoal({ ujianId, onSuccess }: { ujianId: string; onSuccess?: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  function reset() {
    setFileName("")
    setQuestions([])
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }
  function close() {
    if (!isImporting) {
      setOpen(false)
      reset()
    }
  }
  async function handleFile(file?: File) {
    if (!file) return
    setFileName(file.name)
    setError("")
    setQuestions([])
    setIsParsing(true)
    try {
      setQuestions(await parseFile(file, ujianId))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "File tidak dapat dibaca.")
    } finally {
      setIsParsing(false)
    }
  }
  async function importQuestions() {
    setIsImporting(true)
    setError("")
    try {
      const response = await fetch(`/api/ujian/${ujianId}/soal/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soal: questions }),
      })
      const result = await readApiResponse(response)
      if (!response.ok) throw new Error(result.message ?? "Impor gagal.")
      setOpen(false)
      reset()
      onSuccess?.()
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impor gagal.")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Import soal
      </Button>
      <Modal open={open} onClose={close} title="Import Soal" maxWidth="760px">
        <div className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-[18px] border border-dashed border-[#b8c8c0] bg-gradient-to-br from-white via-[#f8fafc] to-[#eef2ff] p-6 text-center shadow-[0_8px_24px_-12px_rgba(49,46,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(49,46,129,0.35)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.18),transparent_65%)]" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca] shadow-[0_8px_20px_-6px_rgba(67,56,202,0.5)]">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">Pilih file soal</p>
                <p className="mt-1 text-[12px] text-[#8b93a6] dark:text-white/50">
                  Excel/CSV: pertanyaan, opsiA-E, jawaban, tipe, poin. Word/PDF/TXT: pisahkan soal dengan baris kosong.
                </p>
              </div>
              <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-[10px] bg-white px-4 py-2 text-[12.5px] font-medium text-[#4338ca] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#eef2ff] dark:bg-white/5 dark:text-[#818cf8] dark:hover:bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                </svg>
                Pilih File
                <input
                  ref={inputRef}
                  type="file"
                  accept=".docx,.xlsx,.xls,.csv,.pdf,.txt"
                  className="hidden"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
              </label>
              {fileName && (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-3 py-1 text-[11.5px] font-medium text-[#059669] dark:bg-emerald-500/10 dark:text-emerald-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {fileName}
                </p>
              )}
            </div>
          </div>

          {isParsing && (
            <p className="flex items-center gap-2 text-[13px] text-[#5b657d] dark:text-white/50">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Membaca file...
            </p>
          )}

          {error && (
            <p className="rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b] dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}

          {questions.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[#16233f] dark:text-white">
                Pratinjau {questions.length} soal
              </p>
              <div className="max-h-72 overflow-y-auto rounded-[12px] border border-[#edf0ef] dark:border-white/10">
                {questions.slice(0, 10).map((question, index) => {
                  const { bacaan, soal } = splitBacaanDanSoal(question.pertanyaan)
                  return (
                    <div
                      key={`${question.pertanyaan}-${index}`}
                      className="border-b border-[#f0f2f1] px-3.5 py-2.5 last:border-0 dark:border-white/5"
                    >
                      {bacaan && (
                        <div className="mb-2 rounded-[8px] border border-amber-200 bg-amber-50/60 px-2.5 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
                          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            Bacaan
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-[11.5px] leading-relaxed text-amber-900 dark:text-amber-100">
                            {bacaan.length > 300 ? `${bacaan.slice(0, 300)}...` : bacaan}
                          </p>
                        </div>
                      )}
                      <p className="text-[12.5px] font-medium text-[#34435f] dark:text-white/80">
                        {index + 1}. {soal.length > 150 ? `${soal.slice(0, 150)}...` : soal}
                      </p>
                      <p className="mt-1 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                        {question.tipe === "ESSAY" ? "Essay" : `${question.opsi?.length ?? 0} opsi`} · {question.poin} poin
                      </p>
                    </div>
                  )
                })}
              </div>
              {questions.length > 10 && (
                <p className="mt-1 text-[11.5px] text-[#8b93a6] dark:text-white/40">Menampilkan 10 soal pertama.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={close} disabled={isImporting}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => void importQuestions()}
              disabled={questions.length === 0 || isParsing}
              isLoading={isImporting}
            >
              Import {questions.length > 0 ? `${questions.length} soal` : "soal"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}