import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import ExcelJS from "exceljs"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KUNCI_LAINNYA = "__lainnya"
const LABEL_LAINNYA = "Lainnya"
const BARIS_HEADER = 4

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

function namaSheetAman(teks: string, dipakai: Set<string>) {
  const dasar = (teks.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31)) || "Nilai"
  let nama = dasar
  let n = 2
  while (dipakai.has(nama.toLowerCase())) {
    const akhiran = ` (${n++})`
    nama = dasar.slice(0, 31 - akhiran.length) + akhiran
  }
  dipakai.add(nama.toLowerCase())
  return nama
}

function bulat1(n: number) {
  return Math.round(n * 10) / 10
}

function rata(list: number[]) {
  return list.length ? bulat1(list.reduce((s, v) => s + v, 0) / list.length) : null
}

function warnaSkor(skor: number) {
  return skor >= 80 ? "FFD1FAE5" : skor >= 60 ? "FFFEF3C7" : "FFFEE2E2"
}

type UjianData = Awaited<ReturnType<typeof ambilUjian>>[number]

async function ambilUjian(guruId: string) {
  return prisma.ujian.findMany({
    where: { pembuatId: guruId },
    orderBy: { mulai: "asc" },
    include: {
      hasilUjian: {
        select: {
          userId: true,
          skor: true,
          status: true,
          user: { select: { nama: true, nisn: true } },
        },
      },
    },
  })
}

function kunciMapel(u: UjianData) {
  return (u.mataPelajaran ?? "").trim() || KUNCI_LAINNYA
}

function tambahSheetMapel(
  wb: ExcelJS.Workbook,
  namaMapel: string,
  daftarUjian: UjianData[],
  dipakai: Set<string>
) {
  const jumlahUjian = daftarUjian.length
  const kolomRata = 4 + jumlahUjian
  const ws = wb.addWorksheet(namaSheetAman(namaMapel, dipakai), {
    views: [{ state: "frozen", xSplit: 3, ySplit: BARIS_HEADER }],
  })

  ws.getColumn(1).width = 6
  ws.getColumn(2).width = 18
  ws.getColumn(3).width = 34
  for (let i = 0; i < jumlahUjian; i++) ws.getColumn(4 + i).width = 18
  ws.getColumn(kolomRata).width = 14

  const hurufAkhir = ws.getColumn(kolomRata).letter

  // Judul
  ws.mergeCells(`A1:${hurufAkhir}1`)
  ws.getCell("A1").value = `Rekap Nilai Mapel — ${namaMapel}`
  ws.getCell("A1").font = { bold: true, size: 14 }

  ws.mergeCells(`A2:${hurufAkhir}2`)
  ws.getCell("A2").value = `Jumlah Ujian: ${jumlahUjian}`

  // Kumpulkan peserta unik dari seluruh ujian di mapel ini
  type Sel = { skor: number | null; status: string }
  const peserta = new Map<string, { nama: string; nisn: string | null; nilai: Map<string, Sel> }>()
  for (const u of daftarUjian) {
    for (const h of u.hasilUjian) {
      let p = peserta.get(h.userId)
      if (!p) {
        p = { nama: h.user.nama, nisn: h.user.nisn, nilai: new Map() }
        peserta.set(h.userId, p)
      }
      p.nilai.set(u.id, { skor: h.skor, status: h.status })
    }
  }
  const daftarPeserta = [...peserta.values()].sort((a, b) => a.nama.localeCompare(b.nama, "id"))

  // Header tabel
  const header = ws.getRow(BARIS_HEADER)
  header.values = [
    "No",
    "NISN",
    "Nama Peserta",
    ...daftarUjian.map((u) => u.judul),
    "Rata-rata",
  ]
  header.height = 36
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4338CA" } }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
  })

  // Data siswa
  const skorPerUjian: number[][] = daftarUjian.map(() => [])
  const semuaSkor: number[] = []

  daftarPeserta.forEach((p, idx) => {
    const row = ws.getRow(BARIS_HEADER + 1 + idx)
    row.getCell(1).value = idx + 1
    row.getCell(2).value = p.nisn ?? "-"
    row.getCell(2).numFmt = "@"
    row.getCell(3).value = amanSel(p.nama)

    const skorSiswa: number[] = []
    daftarUjian.forEach((u, i) => {
      const cell = row.getCell(4 + i)
      const n = p.nilai.get(u.id)
      if (n && n.status === "SELESAI" && n.skor !== null) {
        cell.value = n.skor
        cell.numFmt = "0.##"
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: warnaSkor(n.skor) } }
        skorSiswa.push(n.skor)
        skorPerUjian[i].push(n.skor)
        semuaSkor.push(n.skor)
      } else if (n) {
        cell.value = "Mengerjakan"
      } else {
        cell.value = "-"
      }
      cell.alignment = { horizontal: "center" }
    })

    const rataSiswa = rata(skorSiswa)
    const cRata = row.getCell(kolomRata)
    cRata.value = rataSiswa ?? "-"
    cRata.font = { bold: true }
    cRata.alignment = { horizontal: "center" }
    if (rataSiswa !== null) {
      cRata.fill = { type: "pattern", pattern: "solid", fgColor: { argb: warnaSkor(rataSiswa) } }
    }

    ;[1, 2].forEach((c) => (row.getCell(c).alignment = { horizontal: "center" }))
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: "FFCBD5E1" } } }
    })
  })

  // Statistik di bawah tabel
  let baris = BARIS_HEADER + daftarPeserta.length + 2
  const statistik: [string, (l: number[]) => number | string][] = [
    ["Peserta Selesai", (l) => l.length],
    ["Rata-rata", (l) => rata(l) ?? "-"],
    ["Nilai Tertinggi", (l) => (l.length ? Math.max(...l) : "-")],
    ["Nilai Terendah", (l) => (l.length ? Math.min(...l) : "-")],
  ]
  for (const [label, fn] of statistik) {
    const row = ws.getRow(baris++)
    ws.mergeCells(`A${row.number}:C${row.number}`)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true }
    row.getCell(1).alignment = { horizontal: "right" }
    skorPerUjian.forEach((list, i) => {
      const cell = row.getCell(4 + i)
      cell.value = fn(list)
      cell.alignment = { horizontal: "center" }
      cell.font = { bold: true }
    })
    const cAkhir = row.getCell(kolomRata)
    cAkhir.value = fn(semuaSkor)
    cAkhir.alignment = { horizontal: "center" }
    cAkhir.font = { bold: true }
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }
    })
  }

  return { jumlahPeserta: daftarPeserta.length, rataRata: rata(semuaSkor) }
}

export async function GET(req: Request) {
  // Auth khusus API: balas 401/403, bukan redirect
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }
  const user = session.user as { id?: string; role?: string }
  if (user.role !== "GURU" || !user.id) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 })
  }

  // ?mapel=NAMA  → satu mapel | tanpa parameter → semua mapel
  const mapelDiminta = new URL(req.url).searchParams.get("mapel")?.trim() || null

  const semuaUjian = await ambilUjian(user.id)

  // Kelompokkan per mapel (urut abjad, "Lainnya" di akhir)
  const kelompok = new Map<string, UjianData[]>()
  for (const u of semuaUjian) {
    const k = kunciMapel(u)
    kelompok.set(k, [...(kelompok.get(k) ?? []), u])
  }
  const kunciUrut = [...kelompok.keys()].sort((a, b) => {
    if (a === KUNCI_LAINNYA) return 1
    if (b === KUNCI_LAINNYA) return -1
    return a.localeCompare(b, "id")
  })

  const kunciDipilih = mapelDiminta
    ? kunciUrut.filter((k) => k.toLowerCase() === mapelDiminta.toLowerCase())
    : kunciUrut

  if (kunciDipilih.length === 0) {
    return NextResponse.json({ message: "Mata pelajaran tidak ditemukan" }, { status: 404 })
  }

  const wb = new ExcelJS.Workbook()
  wb.creator = "Ujian Online"
  wb.created = new Date()

  const dipakai = new Set<string>()

  // Mode semua mapel: sheet "Ringkasan" di depan
  let sheetRingkasan: ExcelJS.Worksheet | null = null
  if (!mapelDiminta) {
    sheetRingkasan = wb.addWorksheet(namaSheetAman("Ringkasan", dipakai))
  }

  const barisRingkasan: (string | number)[][] = []
  for (const k of kunciDipilih) {
    const label = k === KUNCI_LAINNYA ? LABEL_LAINNYA : k
    const daftar = kelompok.get(k)!
    const info = tambahSheetMapel(wb, label, daftar, dipakai)
    barisRingkasan.push([label, daftar.length, info.jumlahPeserta, info.rataRata ?? "-"])
  }

  if (sheetRingkasan) {
    sheetRingkasan.columns = [
      { width: 34 },
      { width: 14 },
      { width: 16 },
      { width: 14 },
    ]
    sheetRingkasan.mergeCells("A1:D1")
    sheetRingkasan.getCell("A1").value = "Ringkasan Nilai Semua Mata Pelajaran"
    sheetRingkasan.getCell("A1").font = { bold: true, size: 14 }

    const h = sheetRingkasan.getRow(3)
    h.values = ["Mata Pelajaran", "Jumlah Ujian", "Jumlah Peserta", "Rata-rata"]
    h.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4338CA" } }
      cell.alignment = { horizontal: "center", vertical: "middle" }
    })
    barisRingkasan.forEach((r) => {
      const row = sheetRingkasan!.addRow(r)
      ;[2, 3, 4].forEach((c) => (row.getCell(c).alignment = { horizontal: "center" }))
      row.eachCell((cell) => {
        cell.border = { bottom: { style: "hair", color: { argb: "FFCBD5E1" } } }
      })
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const namaBerkas = mapelDiminta
    ? `Nilai_Mapel_${namaFileAman(kunciDipilih[0] === KUNCI_LAINNYA ? LABEL_LAINNYA : kunciDipilih[0]) || "mapel"}`
    : "Nilai_Semua_Mapel"

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${namaBerkas}.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}