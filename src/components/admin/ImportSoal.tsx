"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"

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
    const numberFirst = [...line.matchAll(/(?:^|\s)(\d{1,3})\s*[.):=\-]?\s*(?:jawaban\s*[:=\-]?\s*)?(?:opsi\s*)?\(?([A-E]|[1-5])\)?(?=\s|$)/gi)]
    const letterFirst = [...line.matchAll(/(?:^|\s)([A-E])\s*(\d{1,3})\s*[.):=\-]?(?=\s|$)/gi)]
    for (const match of numberFirst) answers.set(Number(match[1]), parseAnswer(match[2]))
    for (const match of letterFirst) answers.set(Number(match[2]), parseAnswer(match[1]))
  }
  return answers
}

function isAnswerListLine(line: string) {
  const numberFirst = [...line.matchAll(/(?:^|\s)(\d{1,3})\s*[.):=\-]?\s*(?:opsi\s*)?\(?([A-E]|[1-5])\)?(?=\s|$)/gi)]
  const letterFirst = [...line.matchAll(/(?:^|\s)([A-E])\s*(\d{1,3})\s*[.):=\-]?(?=\s|$)/gi)]
  return numberFirst.length >= 2 || letterFirst.length >= 2 || /^(?:soal\s*)?\d+\s*[.):=\-]\s*(?:opsi\s*)?\(?[A-E1-5]\)?\s*$/i.test(line)
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

function parseText(text: string): Question[] {
  const lines = text.replace(/\r/g, "").replace(/[\u00a0\u200b]/g, " ").replace(/[\t]+/g, " ").split("\n").map((line) => line.trim()).filter(Boolean)
  const globalAnswers = extractGlobalAnswers(lines)
  const blocks: string[][] = []
  let inAnswerSection = false
  for (const line of lines) {
    if (/^(?:kunci\s+jawaban|kunci|daftar\s+jawaban|jawaban)\s*:?$/i.test(line)) {
      inAnswerSection = true
      continue
    }
    if (isAnswerListLine(line)) {
      if (inAnswerSection || extractGlobalAnswers([line]).size > 0) continue
    }
    if (!isAnswerListLine(line) && /^(\d+[.)]|soal\s*\d*[:.)]?)/i.test(line)) {
      inAnswerSection = false
      blocks.push([])
    }
    if (blocks.length > 0) blocks[blocks.length - 1].push(line)
  }

  return blocks.flatMap((lines, index): Question[] => {
    const questionLine = lines[0]
    const question = questionLine.replace(/^(\d+[.)]|soal\s*\d*[:.)]?)\s*/i, "").trim()
    const questionNumber = Number(questionLine.match(/^(\d+)/)?.[1])
    const options = extractOptions(lines)
    const markedAnswer = options.find((option) => /(?:\[x\]|\(benar\)|\*)/i.test(lines.find((line) => line.includes(option.teks)) ?? ""))?.label ?? ""
    const answer = extractAnswer(lines) || globalAnswers.get(questionNumber) || markedAnswer
    if (!question) throw new Error(`Blok soal ke-${index + 1} kosong.`)
    if (/^(ujian|pilihan ganda|nama\s*:|petunjuk\s*:|kelas\s*:|tanggal\s*:)/i.test(question)) return []
    if (options.length === 0) return [{ pertanyaan: question, tipe: "ESSAY", poin: 1, opsi: [] }]
    if (options.length < 2) throw new Error(`Blok soal ke-${index + 1}: hanya ${options.length} opsi terbaca. Pastikan opsi memakai format A. teks, B. teks, dan seterusnya.`)
    if (!answer) throw new Error(`Blok soal ke-${index + 1}: kunci jawaban tidak ditemukan. Isi kunci dengan A-E, misalnya "Jawaban: A" atau "Kunci: (A)".`)
    return [{ pertanyaan: question, tipe: "PILIHAN_GANDA", poin: 1, opsi: options.map((option) => ({ teks: option.teks, benar: option.label === answer })) }]
  })
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
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return parseText(result.value)
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

  function reset() { setFileName(""); setQuestions([]); setError(""); if (inputRef.current) inputRef.current.value = "" }
  function close() { if (!isImporting) { setOpen(false); reset() } }
  async function handleFile(file?: File) {
    if (!file) return
    setFileName(file.name); setError(""); setQuestions([]); setIsParsing(true)
    try { setQuestions(await parseFile(file, ujianId)) } catch (reason) { setError(reason instanceof Error ? reason.message : "File tidak dapat dibaca.") } finally { setIsParsing(false) }
  }
  async function importQuestions() {
    setIsImporting(true); setError("")
    try {
      const response = await fetch(`/api/ujian/${ujianId}/soal/import`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ soal: questions }) })
      const result = await readApiResponse(response)
      if (!response.ok) throw new Error(result.message ?? "Impor gagal.")
      setOpen(false); reset(); onSuccess?.(); router.refresh()
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impor gagal.") } finally { setIsImporting(false) }
  }

  return <>
    <Button type="button" variant="outline" onClick={() => setOpen(true)}>Import soal</Button>
    <Modal open={open} onClose={close} title="Import Soal" maxWidth="720px">
      <div className="flex flex-col gap-4">
        <div className="rounded-[12px] border border-dashed border-[#b8c8c0] bg-[#f7f9f8] p-5 text-center">
          <p className="text-[13px] font-medium text-[#16233f]">Pilih file soal</p>
          <p className="mt-1 text-[12px] text-[#8b93a6]">Excel/CSV: pertanyaan, opsiA-E, jawaban, tipe, poin. Word/PDF/TXT: pisahkan soal dengan baris kosong.</p>
          <input ref={inputRef} type="file" accept=".docx,.xlsx,.xls,.csv,.pdf,.txt" className="mt-3 block w-full text-[12px] text-[#5b657d]" onChange={(event) => void handleFile(event.target.files?.[0])} />
          {fileName && <p className="mt-2 text-[12px] text-[#059669]">{fileName}</p>}
        </div>
        {isParsing && <p className="text-[13px] text-[#5b657d]">Membaca file...</p>}
        {error && <p className="rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b]">{error}</p>}
        {questions.length > 0 && <div><p className="mb-2 text-[13px] font-semibold text-[#16233f]">Pratinjau {questions.length} soal</p><div className="max-h-56 overflow-y-auto rounded-[10px] border border-[#edf0ef]">{questions.slice(0, 10).map((question, index) => <div key={`${question.pertanyaan}-${index}`} className="border-b border-[#f0f2f1] px-3.5 py-2.5 last:border-0"><p className="text-[12.5px] font-medium text-[#34435f]">{index + 1}. {question.pertanyaan}</p><p className="mt-1 text-[11.5px] text-[#8b93a6]">{question.tipe === "ESSAY" ? "Essay" : `${question.opsi?.length ?? 0} opsi`} · {question.poin} poin</p></div>)}</div>{questions.length > 10 && <p className="mt-1 text-[11.5px] text-[#8b93a6]">Menampilkan 10 soal pertama.</p>}</div>}
        <div className="flex justify-end gap-2.5"><Button type="button" variant="outline" onClick={close} disabled={isImporting}>Batal</Button><Button type="button" onClick={() => void importQuestions()} disabled={questions.length === 0 || isParsing} isLoading={isImporting}>Import {questions.length > 0 ? `${questions.length} soal` : "soal"}</Button></div>
      </div>
    </Modal>
  </>
}