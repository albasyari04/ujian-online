import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import ExcelJS from "exceljs"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const formatWaktu = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
})

function namaFileAman(teks: string) {
  return teks
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 80)
}

// Cegah formula injection di Excel (nama diawali = + - @)
function amanSel(teks: string) {
  return /^[=+\-@]/.test(teks) ? `'${teks}` : teks
}

function namaSheetAman(teks: string) {
  const bersih = teks.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31)
  return bersih || "Nilai"
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth khusus API: balas 401/403, bukan redirect
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
        include: {
          user: { select: { nama: true, nisn: true, noUrut: true } },
          _count: { select: { logPelanggaran: true } },
        },
      },
    },
  })

  if (!ujian) {
    return NextResponse.json({ message: "Ujian tidak ditemukan" }, { status: 404 })
  }

  // Skor tertinggi dulu, yang belum bernilai di bawah
  const hasil = [...ujian.hasilUjian].sort((a, b) => (b.skor ?? -1) - (a.skor ?? -1))

  // Logika sama dengan halaman daftar: hanya SELESAI yang punya skor
  const selesai = hasil.filter((h) => h.status === "SELESAI" && h.skor !== null)
  const skorList = selesai.map((h) => h.skor as number)
  const rataRata = skorList.length
    ? Math.round((skorList.reduce((s, v) => s + v, 0) / skorList.length) * 10) / 10
    : null
  const tertinggi = skorList.length ? Math.max(...skorList) : null
  const terendah = skorList.length ? Math.min(...skorList) : null

  const wb = new ExcelJS.Workbook()
  wb.creator = "Ujian Online"
  wb.created = new Date()

  const ws = wb.addWorksheet(namaSheetAman(ujian.mataPelajaran || ujian.judul), {
    views: [{ state: "frozen", ySplit: 10 }],
  })

  ws.columns = [
    { key: "no", width: 6 },
    { key: "nisn", width: 18 },
    { key: "nama", width: 34 },
    { key: "status", width: 16 },
    { key: "skor", width: 10 },
    { key: "pelanggaran", width: 14 },
    { key: "waktu", width: 22 },
  ]

  // Judul
  ws.mergeCells("A1:G1")
  ws.getCell("A1").value = `Rekap Nilai — ${ujian.judul}`
  ws.getCell("A1").font = { bold: true, size: 14 }

  ws.mergeCells("A2:G2")
  ws.getCell("A2").value =
    `Mata Pelajaran: ${ujian.mataPelajaran || "-"}   |   Guru: ${ujian.namaGuru || "-"}`

  // Ringkasan (baris 3–7)
  const ringkasan: [string, string | number][] = [
    ["Jumlah Peserta", hasil.length],
    ["Selesai Dikerjakan", selesai.length],
    ["Rata-rata", rataRata ?? "-"],
    ["Nilai Tertinggi", tertinggi ?? "-"],
    ["Nilai Terendah", terendah ?? "-"],
  ]
  ringkasan.forEach(([label, nilai], i) => {
    const row = 3 + i
    ws.mergeCells(`A${row}:B${row}`)
    ws.getCell(`A${row}`).value = label
    ws.getCell(`A${row}`).font = { bold: true }
    ws.getCell(`C${row}`).value = nilai
    ws.getCell(`C${row}`).alignment = { horizontal: "left" }
  })

  // Header tabel (baris 10)
  const headerRow = ws.getRow(10)
  headerRow.values = ["No", "NISN", "Nama Peserta", "Status", "Nilai", "Pelanggaran", "Waktu Selesai"]
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4338CA" } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
  })
  headerRow.height = 22

  // Data
  hasil.forEach((h, i) => {
    const row = ws.addRow({
      no: i + 1,
      nisn: h.user.nisn ?? "-",
      nama: amanSel(h.user.nama),
      status: h.status === "SELESAI" ? "Selesai" : "Mengerjakan",
      skor: h.skor ?? "-",
      pelanggaran: h._count.logPelanggaran,
      waktu: h.waktuSelesai ? formatWaktu.format(h.waktuSelesai) : "-",
    })

    ;(["no", "nisn", "status", "skor", "pelanggaran", "waktu"] as const).forEach((k) => {
      row.getCell(k).alignment = { horizontal: "center" }
    })
    // NISN sebagai teks agar angka 0 di depan tidak hilang
    row.getCell("nisn").numFmt = "@"

    row.eachCell((cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: "FFCBD5E1" } } }
    })

    // Warna nilai: >=80 hijau, >=60 kuning, <60 merah
    if (typeof h.skor === "number") {
      const argb = h.skor >= 80 ? "FFD1FAE5" : h.skor >= 60 ? "FFFEF3C7" : "FFFEE2E2"
      row.getCell("skor").fill = { type: "pattern", pattern: "solid", fgColor: { argb } }
    }
  })

  const buffer = await wb.xlsx.writeBuffer()
  const filename = `Nilai_${namaFileAman(ujian.judul) || "ujian"}.xlsx`

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}