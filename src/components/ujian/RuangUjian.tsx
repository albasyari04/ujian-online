"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { NavigasiSoal } from "@/components/ujian/NavigasiSoal"
import { PengawasUjian } from "@/components/ujian/PengawasUjian"
import { SoalCard, type SoalPeserta } from "@/components/ujian/SoalCard"
import { Timer } from "@/components/ujian/Timer"
import type { PengaturanPelanggaranAktif } from "@/lib/pengaturan"

type JawabanAwal = { soalId: string; jawabanTeks: string | null; opsiPilihan: string | null }

export function RuangUjian({
	ujian,
	hasilId,
	waktuSelesai,
	jawabanAwal,
	pengaturanPelanggaran,
}: {
	ujian: { id: string; judul: string; batasPelanggaran: number; soal: SoalPeserta[] }
	hasilId: string
	waktuSelesai: string
	jawabanAwal: JawabanAwal[]
	pengaturanPelanggaran: PengaturanPelanggaranAktif
}) {
	const router = useRouter()
	const [indexAktif, setIndexAktif] = useState(0)
	const [jawaban, setJawaban] = useState<Record<string, string>>(() =>
		Object.fromEntries(jawabanAwal.map((item) => [item.soalId, item.opsiPilihan ?? item.jawabanTeks ?? ""])),
	)
	const [mengirim, setMengirim] = useState(false)
	const [error, setError] = useState("")

	const soal = ujian.soal[indexAktif]
	const simpanJawaban = async (soalId: string, value: string) => {
		setJawaban((current) => ({ ...current, [soalId]: value }))
		const response = await fetch("/api/jawaban", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ hasilUjianId: hasilId, soalId, jawaban: value }),
		})
		if (!response.ok) setError("Jawaban belum tersimpan. Periksa koneksi lalu coba lagi.")
	}

	const kumpulkan = async (otomatis = false) => {
		if (!otomatis && !window.confirm("Kumpulkan jawaban sekarang? Setelah dikumpulkan, jawaban tidak dapat diubah.")) return
		setMengirim(true)
		setError("")
		const response = await fetch(`/api/hasil-ujian/${hasilId}/submit`, { method: "POST" })
		if (response.ok) router.push(`/hasil/${hasilId}`)
		else {
			const result = await response.json().catch(() => null)
			setError(result?.message ?? "Jawaban gagal dikumpulkan.")
			setMengirim(false)
		}
	}

	const hentikanKarenaPelanggaran = async () => {
		const response = await fetch(`/api/hasil-ujian/${hasilId}/submit`, { method: "POST" })
		if (response.ok) router.push(`/hasil/${hasilId}`)
	}

	return (
		<PengawasUjian
			hasilId={hasilId}
			batasPelanggaran={ujian.batasPelanggaran}
			pengaturan={pengaturanPelanggaran}
			onDihentikan={() => void hentikanKarenaPelanggaran()}
		>
		<div className="flex flex-col gap-5">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div><p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#b45309]">Ujian online</p><h1 className="mt-1 text-[24px] font-semibold text-[#16233f]">{ujian.judul}</h1></div>
				<Timer waktuSelesai={waktuSelesai} onHabis={() => void kumpulkan(true)} />
			</header>
			{error && <p className="rounded-[10px] bg-[#fdeaea] px-3 py-2 text-[13px] text-[#b93131]">{error}</p>}
			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
				<div><SoalCard soal={soal} nomor={indexAktif + 1} totalSoal={ujian.soal.length} jawaban={jawaban[soal.id] ?? ""} onJawabChange={(value) => void simpanJawaban(soal.id, value)} /><div className="mt-4 flex justify-between gap-3"><button type="button" disabled={indexAktif === 0} onClick={() => setIndexAktif((current) => current - 1)} className="rounded-[10px] border border-[#dcd9ee] px-4 py-2.5 text-[13px] font-semibold text-[#4338ca] disabled:opacity-40">Sebelumnya</button>{indexAktif === ujian.soal.length - 1 ? <button type="button" disabled={mengirim} onClick={() => void kumpulkan()} className="rounded-[10px] bg-[#4338ca] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">{mengirim ? "Mengirim..." : "Kumpulkan ujian"}</button> : <button type="button" onClick={() => setIndexAktif((current) => current + 1)} className="rounded-[10px] bg-[#4338ca] px-4 py-2.5 text-[13px] font-semibold text-white">Berikutnya</button>}</div></div>
				<NavigasiSoal totalSoal={ujian.soal.length} indexAktif={indexAktif} soalTerjawab={ujian.soal.map((item) => Boolean(jawaban[item.id]?.trim()))} onPindah={setIndexAktif} />
			</div>
		</div>
		</PengawasUjian>
	)
}