"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { BACAAN_START, BACAAN_END, SOAL_START, splitBacaanDanSoal } from "@/lib/bacaan"
import { docxToText } from "@/lib/docxToText"
import { parseRows, parseText, validateQuestions, type Question } from "@/lib/importParser"

export { BACAAN_START, BACAAN_END, SOAL_START, splitBacaanDanSoal }

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

async function parseFile(file: File, ujianId: string): Promise<Question[]> {
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (extension === "xlsx" || extension === "xls" || extension === "csv") {
    const XLSX = await import("xlsx")
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return parseRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }))
  }
  if (extension === "docx") {
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

/** Rapikan payload: trim teks, pastikan bentuk data sesuai yang diharapkan server. */
function buildPayload(questions: Question[]) {
  return questions.map((q) =>
    q.tipe === "ESSAY"
      ? { pertanyaan: q.pertanyaan.trim(), tipe: "ESSAY" as const, poin: q.poin, opsi: [] }
      : {
          pertanyaan: q.pertanyaan.trim(),
          tipe: "PILIHAN_GANDA" as const,
          poin: q.poin,
          opsi: (q.opsi ?? []).map((o) => ({ teks: o.teks.trim(), benar: Boolean(o.benar) })),
        }
  )
}

export function ImportSoal({
  ujianId,
  onSuccess,
  triggerClassName,
}: {
  ujianId: string
  onSuccess?: () => void
  /** Class opsional untuk mengganti style tombol trigger (default: Button variant="outline"). */
  triggerClassName?: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const issues = useMemo(() => validateQuestions(questions), [questions])
  const problemIndexes = useMemo(() => new Set(issues.map((issue) => issue.index)), [issues])

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

  function setKunci(questionIndex: number, optionIndex: number) {
    setError("")
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex && q.tipe === "PILIHAN_GANDA"
          ? { ...q, opsi: (q.opsi ?? []).map((o, j) => ({ ...o, benar: j === optionIndex })) }
          : q
      )
    )
  }

  async function importQuestions() {
    const localIssues = validateQuestions(questions)
    if (localIssues.length > 0) {
      setError(`Perbaiki dulu ${localIssues.length} masalah pada soal sebelum import.`)
      return
    }

    setIsImporting(true)
    setError("")
    try {
      const response = await fetch(`/api/ujian/${ujianId}/soal/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soal: buildPayload(questions) }),
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
      {/* Trigger: pakai triggerClassName jika ada, kalau tidak pakai Button default */}
      {triggerClassName ? (
        <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
          <span>Import soal</span>
        </button>
      ) : (
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Import soal
        </Button>
      )}

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

          {issues.length > 0 && (
            <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <p className="font-semibold">
                {issues.length} masalah ditemukan. Perbaiki di pratinjau di bawah (klik opsi untuk menandai jawaban benar):
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {issues.slice(0, 8).map((issue, i) => (
                  <li key={`${issue.index}-${i}`}>{issue.message}</li>
                ))}
                {issues.length > 8 && <li>...dan {issues.length - 8} masalah lainnya.</li>}
              </ul>
            </div>
          )}

          {questions.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[#16233f] dark:text-white">
                Pratinjau {questions.length} soal
              </p>
              <div className="max-h-96 overflow-y-auto rounded-[12px] border border-[#edf0ef] dark:border-white/10">
                {questions.map((question, index) => {
                  const { bacaan, soal } = splitBacaanDanSoal(question.pertanyaan)
                  const bermasalah = problemIndexes.has(index)
                  return (
                    <div
                      key={`${index}-${question.pertanyaan.slice(0, 30)}`}
                      className={`border-b border-[#f0f2f1] px-3.5 py-2.5 last:border-0 dark:border-white/5 ${
                        bermasalah ? "bg-red-50/60 dark:bg-red-500/5" : ""
                      }`}
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

                      {question.tipe === "PILIHAN_GANDA" ? (
                        <div className="mt-1.5 space-y-1">
                          {(question.opsi ?? []).map((option, optionIndex) => (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() => setKunci(index, optionIndex)}
                              className={`flex w-full items-start gap-2 rounded-[8px] px-2 py-1 text-left text-[11.5px] transition-colors ${
                                option.benar
                                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                                  : "text-[#5b657d] hover:bg-[#f4f5f7] dark:text-white/60 dark:hover:bg-white/5"
                              }`}
                              title="Klik untuk menandai sebagai jawaban benar"
                            >
                              <span
                                className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9.5px] font-bold ${
                                  option.benar
                                    ? "bg-emerald-500 text-white"
                                    : "bg-[#e7e9f0] text-[#5b657d] dark:bg-white/10 dark:text-white/50"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="break-words">{option.teks}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-1 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                        {question.tipe === "ESSAY" ? "Essay" : `${question.opsi?.length ?? 0} opsi`} · {question.poin} poin
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={close} disabled={isImporting}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => void importQuestions()}
              disabled={questions.length === 0 || isParsing || issues.length > 0}
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