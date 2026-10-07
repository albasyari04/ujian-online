import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import ExcelJS from "exceljs"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

const BARIS_HEADER = 5

function namaFileAman(teks: string) {
  return teks.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 80)
}

// Cegah formula injection di Excel (nama diawali = + - @)
function amanSel(teks: string) {
  return /^[=+\-@]/.test(teks) ? `'${teks}` : teks
}

function bulat1(n: number) {
  return Math.round(n * 10) / 10
}

function warnaSkor(skor: number) {
  return skor >= 80 ? "FFD1FAE5" : skor >= 60 ? "FFFEF3C7" : "FFFEE2E2"
}

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }
  const user = session.user as { id?: string; role?: string }
  if (user.role !== "GURU" || !user.id) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 })
  }

  const { id } = await params

  // Hanya ujian milik guru yang sedang login
  const ujian = await prisma.ujian.findFirst({
    where: { id, pembuatId: user.id },
    include: {
      hasilUjian: {
        select: {
          skor: true,
          status: true,
          jumlahPelanggaran: true,
          waktuMulai: true,
          waktuSelesai: true,
          user: { select: { nama: true, nisn: true } },
        },
      },
    },
  })

  if (!ujian) {
    return NextResponse.json({ message: "Ujian tidak ditemukan" }, { status: 404 })
  }

  const daftar = [...ujian.hasilUjian].sort((a, b) =>
    a.user.nama.localeCompare(b.user.nama, "id")
  )
  const skorSelesai = daftar
    .filter((h) => h.status === "SELESAI" && h.skor !== null)
    .map((h) => h.skor as number)

  const wb = new ExcelJS.Workbook()
  wb.creator = "Ujian Online"
  wb.created = new Date()

  const ws = wb.addWorksheet("Nilai", {
    views: [{ state: "frozen", ySplit: BARIS_HEADER }],
  })

  ws.columns = [
    { width: 6 },
    { width: 18 },
    { width: 34 },
    { width: 16 },
    { width: 12 },
    { width: 14 },
    { width: 20 },
    { width: 20 },
  ]

  ws.mergeCells("A1:H1")
  ws.getCell("A1").value = `Rekap Nilai — ${ujian.judul}`
  ws.getCell("A1").font = { bold: true, size: 14 }

  ws.mergeCells("A2:H2")
  ws.getCell("A2").value = `Mata Pelajaran: ${ujian.mataPelajaran || "-"}`

  ws.mergeCells("A3:H3")
  ws.getCell("A3").value = `Jumlah Peserta: ${daftar.length} | Selesai: ${skorSelesai.length}`

  const header = ws.getRow(BARIS_HEADER)
  header.values = [
    "No",
    "NISN",
    "Nama Peserta",
    "Status",
    "Nilai",
    "Pelanggaran",
    "Waktu Mulai",
    "Waktu Selesai",
  ]
  header.height = 28
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4338CA" } }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
  })

  daftar.forEach((h, idx) => {
    const row = ws.getRow(BARIS_HEADER + 1 + idx)
    row.getCell(1).value = idx + 1
    row.getCell(2).value = h.user.nisn ?? "-"
    row.getCell(2).numFmt = "@"
    row.getCell(3).value = amanSel(h.user.nama)
    row.getCell(4).value = h.status === "SELESAI" ? "Selesai" : "Mengerjakan"

    const cNilai = row.getCell(5)
    if (h.status === "SELESAI" && h.skor !== null) {
      cNilai.value = h.skor
      cNilai.numFmt = "0.##"
      cNilai.fill = { type: "pattern", pattern: "solid", fgColor: { argb: warnaSkor(h.skor) } }
      cNilai.font = { bold: true }
    } else {
      cNilai.value = "-"
    }

    row.getCell(6).value = h.jumlahPelanggaran
    row.getCell(7).value = h.waktuMulai.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
    row.getCell(8).value = h.waktuSelesai
      ? h.waktuSelesai.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      : "-"

    ;[1, 2, 4, 5, 6, 7, 8].forEach((c) => (row.getCell(c).alignment = { horizontal: "center" }))
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: "FFCBD5E1" } } }
    })
  })

  // Statistik
  let baris = BARIS_HEADER + daftar.length + 2
  const statistik: [string, number | string][] = [
    ["Peserta Selesai", skorSelesai.length],
    [
      "Rata-rata",
      skorSelesai.length
        ? bulat1(skorSelesai.reduce((s, v) => s + v, 0) / skorSelesai.length)
        : "-",
    ],
    ["Nilai Tertinggi", skorSelesai.length ? Math.max(...skorSelesai) : "-"],
    ["Nilai Terendah", skorSelesai.length ? Math.min(...skorSelesai) : "-"],
  ]
  for (const [label, nilai] of statistik) {
    const row = ws.getRow(baris++)
    ws.mergeCells(`A${row.number}:D${row.number}`)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true }
    row.getCell(1).alignment = { horizontal: "right" }
    row.getCell(5).value = nilai
    row.getCell(5).font = { bold: true }
    row.getCell(5).alignment = { horizontal: "center" }
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const namaBerkas = `Nilai_${namaFileAman(ujian.judul) || "ujian"}`

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${namaBerkas}.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}