import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type Option = { teks: string; benar: boolean }
type Question = { pertanyaan: string; tipe: "PILIHAN_GANDA" | "ESSAY"; poin: number; opsi: Option[] }

function parseAnswer(value: string) {
  const answer = value.trim().toUpperCase().replace(/[.)\],;:]+$/, "")
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
    for (const [matchIndex, match] of matches.entries()) {
      const start = (match.index ?? 0) + match[0].length
      const end = matches[matchIndex + 1]?.index ?? line.length
      const teks = line.slice(start, end).trim()
      if (teks) options.push({ label: match[1].toUpperCase(), teks: teks.replace(/^\s*(?:\[x\]|\(benar\)|\*+)\s*/i, "") })
    }
  }

  return options
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
    const pertanyaan = questionLine.replace(/^(\d+[.)]|soal\s*\d*[:.)]?)\s*/i, "").trim()
    const questionNumber = Number(questionLine.match(/^(\d+)/)?.[1])
    const options = extractOptions(lines)
    const markedAnswer = options.find((option) => /(?:\[x\]|\(benar\)|\*)/i.test(lines.find((line) => line.includes(option.teks)) ?? ""))?.label ?? ""
    const answer = extractAnswer(lines) || globalAnswers.get(questionNumber) || markedAnswer

    if (!pertanyaan) throw new Error(`Blok soal ke-${index + 1} kosong.`)
    if (/^(ujian|pilihan ganda|nama\s*:|petunjuk\s*:|kelas\s*:|tanggal\s*:)/i.test(pertanyaan)) return []
    if (options.length === 0) return [{ pertanyaan, tipe: "ESSAY", poin: 1, opsi: [] }]
    if (options.length < 2) throw new Error(`Blok soal ke-${index + 1}: hanya ${options.length} opsi terbaca. Pastikan opsi memakai format A. teks, B. teks, dan seterusnya.`)
    if (!answer || !options.some((option) => option.label === answer)) {
      throw new Error(`Blok soal ke-${index + 1}: kunci jawaban tidak ditemukan. Isi kunci dengan A-E, misalnya "Jawaban: A" atau "Kunci: (A)".`)
    }

    return [{
      pertanyaan,
      tipe: "PILIHAN_GANDA",
      poin: 1,
      opsi: options.map((option) => ({ teks: option.teks, benar: option.label === answer })),
    }]
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
  }

  const ujian = await prisma.ujian.findUnique({
    where: { id },
    select: { pembuatId: true },
  })

  if (!ujian) {
    return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) return NextResponse.json({ message: "File PDF wajib dipilih." }, { status: 400 })

  try {
    const { default: pdfParse } = await import("pdf-parse")
    const result = await pdfParse(Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ soal: parseText(result.text) })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "PDF tidak dapat dibaca." }, { status: 400 })
  }
}