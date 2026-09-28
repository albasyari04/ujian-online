"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import type { TipePelanggaran } from "@prisma/client"

import { PeringatanModal } from "@/components/ujian/PeringatanModal"
import type { PengaturanPelanggaranAktif } from "@/lib/pengaturan"

const PENGATURAN_DEFAULT: PengaturanPelanggaranAktif = {
	PINDAH_TAB: true,
	KELUAR_FULLSCREEN: true,
	KEHILANGAN_FOKUS: true,
	COPY_PASTE: true,
	KLIK_KANAN: true,
	DEVTOOLS: true,
}

const DESKRIPSI_SINGKAT: Record<TipePelanggaran, string> = {
	PINDAH_TAB: "berpindah tab",
	KELUAR_FULLSCREEN: "keluar layar penuh",
	KEHILANGAN_FOKUS: "kehilangan fokus jendela",
	COPY_PASTE: "menyalin jawaban",
	KLIK_KANAN: "klik kanan",
	DEVTOOLS: "membuka developer tools",
}

/* =========================================================
   KONFIGURASI PEMANTAUAN
========================================================= */
/** Kamera wajib aktif sebelum ujian bisa dimulai. */
const WAJIB_KAMERA = true
/** Berbagi layar wajib — hanya berlaku di perangkat yang mendukung (desktop). HP hanya kamera. */
const WAJIB_LAYAR = true
/** Jeda antar pengiriman snapshot ke server. Naikkan bila peserta sangat banyak. */
const INTERVAL_SNAPSHOT_MS = 8_000
/** Jeda minimum agar event ganda (mis. visibilitychange + blur) tidak dihitung dua kali. */
const COOLDOWN_PELANGGARAN_MS = 5_000
const BLUR_GRACE_MS = 600
const UKURAN_KAMERA = { lebarMaks: 320, kualitas: 0.6 }
const UKURAN_LAYAR = { lebarMaks: 960, kualitas: 0.55 }

/* =========================================================
   HELPER
========================================================= */
const subscribeKosong = () => () => {}
const dukungLayar = () => typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function"

function pesanErrorMedia(error: unknown, jenis: "kamera" | "layar") {
	const nama = error instanceof DOMException ? error.name : ""
	if (nama === "NotAllowedError") {
		return jenis === "kamera"
			? "Izin kamera ditolak. Klik ikon gembok di address bar, izinkan kamera, lalu coba lagi."
			: "Izin berbagi layar ditolak atau dibatalkan. Coba lagi, lalu pilih “Seluruh layar”."
	}
	if (nama === "NotFoundError") return "Kamera tidak ditemukan pada perangkat ini."
	if (nama === "NotReadableError") return "Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi."
	return `Gagal mengaktifkan ${jenis}. Pastikan halaman dibuka lewat HTTPS, lalu coba lagi.`
}

function buatVideo(stream: MediaStream) {
	const video = document.createElement("video")
	video.muted = true
	video.playsInline = true
	video.srcObject = stream
	void video.play().catch(() => {})
	return video
}

/** Ambil satu frame dari video sebagai JPEG base64 (tanpa prefix data URL). */
function ambilFrame(video: HTMLVideoElement, lebarMaks: number, kualitas: number) {
	const lebar = video.videoWidth
	const tinggi = video.videoHeight
	if (!lebar || !tinggi || video.readyState < 2) return null
	const skala = Math.min(1, lebarMaks / lebar)
	const canvas = document.createElement("canvas")
	canvas.width = Math.round(lebar * skala)
	canvas.height = Math.round(tinggi * skala)
	const ctx = canvas.getContext("2d")
	if (!ctx) return null
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
	const dataUrl = canvas.toDataURL("image/jpeg", kualitas)
	return dataUrl.slice(dataUrl.indexOf(",") + 1)
}

function trackHidup(stream: MediaStream | null) {
	return stream?.getVideoTracks()[0]?.readyState === "live"
}

/* =========================================================
   ALARM (WebAudio)
   Pola dijadwalkan lewat jam audio, jadi tetap berbunyi walau tab
   ujian sedang di latar belakang dan timer browser diperlambat.
   AudioContext harus dibuat/di-resume dari klik peserta (unlock).
========================================================= */
function useAlarm() {
	const ctxRef = useRef<AudioContext | null>(null)
	const oscRef = useRef<OscillatorNode | null>(null)

	const unlock = useCallback(() => {
		if (!ctxRef.current) {
			const Ctor =
				window.AudioContext ??
				(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
			if (!Ctor) return
			ctxRef.current = new Ctor()
		}
		void ctxRef.current.resume()
	}, [])

	const mainkan = useCallback((durasi: number) => {
		const ctx = ctxRef.current
		if (!ctx) return null
		void ctx.resume()
		const osc = ctx.createOscillator()
		const gain = ctx.createGain()
		osc.type = "square"
		gain.gain.value = 0.5
		const awal = ctx.currentTime
		for (let t = 0, i = 0; t < durasi; t += 0.35, i += 1) {
			osc.frequency.setValueAtTime(i % 2 === 0 ? 988 : 740, awal + t)
		}
		osc.connect(gain)
		gain.connect(ctx.destination)
		osc.start(awal)
		osc.stop(awal + durasi)
		return osc
	}, [])

	const mulai = useCallback(() => {
		if (oscRef.current) return
		const osc = mainkan(300)
		if (!osc) return
		osc.onended = () => {
			if (oscRef.current === osc) oscRef.current = null
		}
		oscRef.current = osc
	}, [mainkan])

	const berhenti = useCallback(() => {
		const osc = oscRef.current
		oscRef.current = null
		if (!osc) return
		try {
			osc.stop()
		} catch {
			// sudah berhenti
		}
		osc.disconnect()
	}, [])

	const tes = useCallback(() => {
		unlock()
		mainkan(0.7)
	}, [mainkan, unlock])

	const tutup = useCallback(() => {
		berhenti()
		void ctxRef.current?.close()
		ctxRef.current = null
	}, [berhenti])

	useEffect(() => tutup, [tutup])

	return useMemo(() => ({ unlock, mulai, berhenti, tes }), [unlock, mulai, berhenti, tes])
}

/* =========================================================
   KOMPONEN KECIL
========================================================= */
function PratinjauKamera({ stream, className = "" }: { stream: MediaStream; className?: string }) {
	const ref = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		el.srcObject = stream
		void el.play().catch(() => {})
	}, [stream])

	return <video ref={ref} muted playsInline autoPlay className={`scale-x-[-1] bg-black object-cover ${className}`} />
}

function Langkah({
	nomor,
	judul,
	selesai,
	children,
}: {
	nomor: number
	judul: string
	selesai: boolean
	children: React.ReactNode
}) {
	return (
		<li className="flex gap-3 rounded-xl border border-[#e7e4dc] p-3 text-left">
			<span
				className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
					selesai ? "bg-[#047857] text-white" : "bg-[#eef2ff] text-[#4338ca]"
				}`}
			>
				{selesai ? "✓" : nomor}
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-[13.5px] font-semibold text-[#16233f]">{judul}</p>
				<div className="mt-2 flex flex-col items-start gap-2">{children}</div>
			</div>
		</li>
	)
}

const TOMBOL_LANGKAH =
	"rounded-[10px] border border-[#c7d2fe] bg-[#eef2ff] px-3.5 py-2 text-[12.5px] font-semibold text-[#4338ca] hover:bg-[#e0e7ff]"

/* =========================================================
   PENGAWAS UJIAN
========================================================= */
export function PengawasUjian({
	hasilId,
	batasPelanggaran,
	pengaturan = PENGATURAN_DEFAULT,
	onDihentikan,
	children,
}: {
	hasilId: string
	batasPelanggaran: number
	pengaturan?: PengaturanPelanggaranAktif
	onDihentikan: () => void
	children: React.ReactNode
}) {
	const router = useRouter()
	const alarm = useAlarm()
	const layarDidukung = useSyncExternalStore(subscribeKosong, dukungLayar, () => false)

	const [dimulai, setDimulai] = useState(false)
	const [setuju, setSetuju] = useState(false)
	const [modal, setModal] = useState<TipePelanggaran | null>(null)
	const [jumlahPelanggaran, setJumlahPelanggaran] = useState(0)

	const [streamKamera, setStreamKamera] = useState<MediaStream | null>(null)
	const [layarSiap, setLayarSiap] = useState(false)
	const [pesanKamera, setPesanKamera] = useState("")
	const [pesanLayar, setPesanLayar] = useState("")
	const [kameraPutus, setKameraPutus] = useState(false)
	const [layarPutus, setLayarPutus] = useState(false)

	const [jauhTab, setJauhTab] = useState(false)
	const [jauhFokus, setJauhFokus] = useState(false)
	const [keluarFullscreen, setKeluarFullscreen] = useState(false)

	const terakhirTercatat = useRef<Partial<Record<TipePelanggaran, number>>>({})
	const sedangKirim = useRef(false)
	const sedangKirimSnapshot = useRef(false)
	const sedangDialog = useRef(false)
	const sudahMulai = useRef(false)
	const wajibFullscreen = useRef(false)
	const kameraStream = useRef<MediaStream | null>(null)
	const layarStream = useRef<MediaStream | null>(null)
	const kameraVideo = useRef<HTMLVideoElement | null>(null)
	const layarVideo = useRef<HTMLVideoElement | null>(null)

	const hentikanSemuaStream = useCallback(() => {
		kameraStream.current?.getTracks().forEach((track) => track.stop())
		layarStream.current?.getTracks().forEach((track) => track.stop())
		kameraStream.current = null
		layarStream.current = null
	}, [])

	// Matikan kamera & berbagi layar saat komponen dilepas (ujian selesai / pindah halaman).
	useEffect(() => hentikanSemuaStream, [hentikanSemuaStream])

	function pasangKamera(stream: MediaStream) {
		kameraStream.current?.getTracks().forEach((track) => track.stop())
		kameraStream.current = stream
		kameraVideo.current = buatVideo(stream)
		setStreamKamera(stream)
		setKameraPutus(false)
		stream.getVideoTracks()[0]?.addEventListener("ended", () => {
			if (kameraStream.current !== stream) return
			setStreamKamera(null)
			if (sudahMulai.current) setKameraPutus(true)
		})
	}

	function pasangLayar(stream: MediaStream) {
		layarStream.current?.getTracks().forEach((track) => track.stop())
		layarStream.current = stream
		layarVideo.current = buatVideo(stream)
		setLayarSiap(true)
		setLayarPutus(false)
		stream.getVideoTracks()[0]?.addEventListener("ended", () => {
			if (layarStream.current !== stream) return
			setLayarSiap(false)
			if (sudahMulai.current) setLayarPutus(true)
		})
	}

	async function aktifkanKamera() {
		setPesanKamera("")
		if (!navigator.mediaDevices?.getUserMedia) {
			setPesanKamera("Browser ini tidak mendukung kamera, atau halaman tidak dibuka lewat HTTPS.")
			return
		}
		sedangDialog.current = true
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
				audio: false,
			})
			pasangKamera(stream)
		} catch (error) {
			setPesanKamera(pesanErrorMedia(error, "kamera"))
		} finally {
			sedangDialog.current = false
		}
	}

	async function bagikanLayar() {
		setPesanLayar("")
		if (!navigator.mediaDevices?.getDisplayMedia) {
			setPesanLayar("Perangkat ini tidak mendukung berbagi layar.")
			return
		}
		sedangDialog.current = true
		try {
			const opsi = { video: { displaySurface: "monitor" }, audio: false } as DisplayMediaStreamOptions
			const stream = await navigator.mediaDevices.getDisplayMedia(opsi)
			const permukaan = (stream.getVideoTracks()[0]?.getSettings() as MediaTrackSettings & { displaySurface?: string })
				.displaySurface
			// Firefox tidak melaporkan displaySurface; hanya tolak bila jelas bukan "monitor".
			if (permukaan && permukaan !== "monitor") {
				stream.getTracks().forEach((track) => track.stop())
				setPesanLayar("Anda memilih tab atau jendela. Pilih “Seluruh layar” (Entire screen) agar semua aktivitas terpantau.")
				return
			}
			pasangLayar(stream)
		} catch (error) {
			setPesanLayar(pesanErrorMedia(error, "layar"))
		} finally {
			sedangDialog.current = false
		}
	}

	async function mulaiUjian() {
		// Harus dipanggil sinkron dari klik agar audio alarm boleh berbunyi nanti.
		alarm.unlock()
		try {
			await document.documentElement.requestFullscreen()
		} catch {
			// Browser dapat menolak fullscreen; pengawasan tetap berjalan.
		}
		wajibFullscreen.current = Boolean(document.fullscreenElement)
		sudahMulai.current = true
		setDimulai(true)
	}

	const catat = useCallback(async (tipe: TipePelanggaran) => {
		if (!pengaturan[tipe]) return
		if (!dimulai || sedangKirim.current) return

		// Cooldown per tipe (bukan sekali seumur ujian): pelanggaran yang sama boleh
		// tercatat lagi, tetapi event ganda dalam hitungan detik dianggap satu.
		const sekarang = Date.now()
		if (sekarang - (terakhirTercatat.current[tipe] ?? 0) < COOLDOWN_PELANGGARAN_MS) return
		terakhirTercatat.current[tipe] = sekarang

		sedangKirim.current = true
		try {
			const response = await fetch("/api/pelanggaran", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ hasilUjianId: hasilId, tipe }),
			})
			const result = await response.json().catch(() => null)
			if (!response.ok || !result) {
				delete terakhirTercatat.current[tipe]
				return
			}
			setJumlahPelanggaran(result.jumlahPelanggaran)
			setModal(tipe)
			if (result.dihentikan) onDihentikan()
		} catch {
			delete terakhirTercatat.current[tipe]
		} finally {
			sedangKirim.current = false
		}
	}, [dimulai, hasilId, onDihentikan, pengaturan])

	// Listener pelanggaran + pemicu alarm.
	useEffect(() => {
		if (!dimulai) return

		let blurTimeout: ReturnType<typeof setTimeout> | null = null

		const onVisibility = () => {
			if (!pengaturan.PINDAH_TAB) return
			if (document.hidden) {
				setJauhTab(true)
				alarm.mulai()
				void catat("PINDAH_TAB")
			} else {
				setJauhTab(false)
			}
		}

		// "blur" murni sangat sensitif — bisa terpicu klik ikon ekstensi, address bar,
		// atau notifikasi OS sekilas. Beri jeda (grace period): baru dianggap pelanggaran
		// jika jendela MASIH belum fokus setelah jeda itu. Dialog izin kamera/layar
		// yang dibuka sistem sendiri juga diabaikan (sedangDialog).
		const onBlur = () => {
			if (document.hidden) return // sudah ditangani oleh PINDAH_TAB
			if (blurTimeout) clearTimeout(blurTimeout)
			blurTimeout = setTimeout(() => {
				blurTimeout = null
				if (sedangDialog.current) return
				if (!document.hidden && !document.hasFocus()) {
					setJauhFokus(true)
					alarm.mulai()
					void catat("KEHILANGAN_FOKUS")
				}
			}, BLUR_GRACE_MS)
		}

		const onFocus = () => {
			if (blurTimeout) {
				clearTimeout(blurTimeout)
				blurTimeout = null
			}
			setJauhFokus(false)
		}

		const onFullscreen = () => {
			if (document.fullscreenElement) {
				setKeluarFullscreen(false)
				return
			}
			if (wajibFullscreen.current) {
				setKeluarFullscreen(true)
				alarm.mulai()
			}
			void catat("KELUAR_FULLSCREEN")
		}

		const onContextMenu = (event: MouseEvent) => {
			if (!pengaturan.KLIK_KANAN) return
			event.preventDefault()
			void catat("KLIK_KANAN")
		}

		const onKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase()
			const devtools = key === "f12" || (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key))
			const clipboard = (event.ctrlKey && ["c", "v", "x"].includes(key)) || (event.metaKey && ["c", "v", "x"].includes(key))
			const tabControl = event.ctrlKey && ["t", "w", "n"].includes(key)

			if (devtools && pengaturan.DEVTOOLS) { event.preventDefault(); void catat("DEVTOOLS") }
			else if (clipboard && pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") }
			else if (tabControl && pengaturan.PINDAH_TAB) { event.preventDefault(); void catat("PINDAH_TAB") }
		}

		if (pengaturan.PINDAH_TAB) document.addEventListener("visibilitychange", onVisibility)
		if (pengaturan.KEHILANGAN_FOKUS) {
			window.addEventListener("blur", onBlur)
			window.addEventListener("focus", onFocus)
		}
		if (pengaturan.KELUAR_FULLSCREEN) document.addEventListener("fullscreenchange", onFullscreen)
		document.addEventListener("contextmenu", onContextMenu)
		document.addEventListener("keydown", onKeyDown)

		return () => {
			document.removeEventListener("visibilitychange", onVisibility)
			window.removeEventListener("blur", onBlur)
			window.removeEventListener("focus", onFocus)
			document.removeEventListener("fullscreenchange", onFullscreen)
			document.removeEventListener("contextmenu", onContextMenu)
			document.removeEventListener("keydown", onKeyDown)
			if (blurTimeout) clearTimeout(blurTimeout)
		}
	}, [alarm, catat, dimulai, pengaturan])

	// Alarm menyala selama salah satu kondisi berikut benar, dan mati otomatis saat semuanya pulih.
	const alarmAktif = dimulai && (jauhTab || jauhFokus || keluarFullscreen || kameraPutus || layarPutus)
	useEffect(() => {
		if (alarmAktif) alarm.mulai()
		else alarm.berhenti()
	}, [alarm, alarmAktif])

	// Kirim snapshot kamera + layar secara berkala ke server.
	useEffect(() => {
		if (!dimulai) return

		async function kirim() {
			if (sedangKirimSnapshot.current) return
			sedangKirimSnapshot.current = true
			try {
				const kamera =
					kameraVideo.current && trackHidup(kameraStream.current)
						? ambilFrame(kameraVideo.current, UKURAN_KAMERA.lebarMaks, UKURAN_KAMERA.kualitas)
						: null
				const layar =
					layarVideo.current && trackHidup(layarStream.current)
						? ambilFrame(layarVideo.current, UKURAN_LAYAR.lebarMaks, UKURAN_LAYAR.kualitas)
						: null

				await fetch("/api/pantau/snapshot", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						hasilUjianId: hasilId,
						kamera,
						layar,
						fokus: !document.hidden && document.hasFocus(),
					}),
				})
			} catch {
				// Gagal kirim sesaat tidak boleh mengganggu ujian; coba lagi di siklus berikutnya.
			} finally {
				sedangKirimSnapshot.current = false
			}
		}

		void kirim()
		const timer = window.setInterval(() => void kirim(), INTERVAL_SNAPSHOT_MS)
		return () => window.clearInterval(timer)
	}, [dimulai, hasilId])

	const daftarLarangan = (Object.keys(DESKRIPSI_SINGKAT) as TipePelanggaran[])
		.filter((tipe) => pengaturan[tipe])
		.map((tipe) => DESKRIPSI_SINGKAT[tipe])

	/* ---------------- LAYAR PERSIAPAN ---------------- */
	if (!dimulai) {
		const kameraOk = streamKamera !== null
		const bisaMulai = setuju && (kameraOk || !WAJIB_KAMERA) && (layarSiap || !layarDidukung || !WAJIB_LAYAR)

		return (
			<div className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-[#16233f]/95 px-4 py-6 sm:items-center">
				<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
					<h2 className="text-center text-[20px] font-semibold text-[#16233f]">Siapkan mode ujian</h2>
					<p className="mt-2 text-center text-[13.5px] leading-6 text-[#5b5490]">
						Ujian berjalan dalam layar penuh dan diawasi.
						{daftarLarangan.length > 0 ? ` Jangan ${daftarLarangan.join(", ")}.` : ""}
					</p>

					<ol className="mt-5 flex flex-col gap-3">
						<Langkah nomor={1} judul="Aktifkan kamera" selesai={kameraOk}>
							{streamKamera && <PratinjauKamera stream={streamKamera} className="h-24 w-32 rounded-lg" />}
							<button type="button" onClick={() => void aktifkanKamera()} className={TOMBOL_LANGKAH}>
								{kameraOk ? "Ulangi kamera" : "Aktifkan kamera"}
							</button>
							{pesanKamera && <p className="text-[12px] leading-5 text-[#d23b3b]">{pesanKamera}</p>}
						</Langkah>

						{layarDidukung ? (
							<Langkah nomor={2} judul="Bagikan seluruh layar" selesai={layarSiap}>
								<p className="text-[12px] leading-5 text-[#5b5490]">
									Pada jendela yang muncul, pilih “Seluruh layar” (Entire screen), lalu klik Bagikan.
								</p>
								<button type="button" onClick={() => void bagikanLayar()} className={TOMBOL_LANGKAH}>
									{layarSiap ? "Ulangi berbagi layar" : "Bagikan layar"}
								</button>
								{pesanLayar && <p className="text-[12px] leading-5 text-[#d23b3b]">{pesanLayar}</p>}
							</Langkah>
						) : (
							<li className="rounded-xl border border-dashed border-[#e7e4dc] p-3 text-left text-[12px] leading-5 text-[#5b5490]">
								Perangkat ini tidak mendukung berbagi layar, jadi hanya kamera yang dipantau.
							</li>
						)}

						<Langkah nomor={layarDidukung ? 3 : 2} judul="Nyalakan suara perangkat" selesai={false}>
							<p className="text-[12px] leading-5 text-[#5b5490]">
								Alarm akan berbunyi bila Anda meninggalkan halaman ujian. Pastikan volume menyala.
							</p>
							<button type="button" onClick={alarm.tes} className={TOMBOL_LANGKAH}>
								Tes suara
							</button>
						</Langkah>
					</ol>

					<label className="mt-5 flex cursor-pointer items-start gap-2.5 text-left text-[12.5px] leading-5 text-[#5b5490]">
						<input
							type="checkbox"
							checked={setuju}
							onChange={(event) => setSetuju(event.target.checked)}
							className="mt-1 h-4 w-4 shrink-0 accent-[#4338ca]"
						/>
						<span>
							Saya memahami bahwa selama ujian, gambar kamera dan layar saya dikirim ke pengawas secara berkala
							(hanya gambar terbaru yang disimpan sementara), dan alarm akan berbunyi bila saya meninggalkan halaman
							ujian.
						</span>
					</label>

					<button
						type="button"
						disabled={!bisaMulai}
						onClick={() => void mulaiUjian()}
						className="mt-4 w-full rounded-[10px] bg-[#4338ca] px-5 py-3 text-[13.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
					>
						Mulai ujian
					</button>
				</div>
			</div>
		)
	}

	/* ---------------- LAYAR UJIAN ---------------- */
	return (
		<>
			<div
				className="select-none"
				onCopy={(event) => { if (pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") } }}
				onCut={(event) => { if (pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") } }}
				onPaste={(event) => { if (pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") } }}
			>
				{children}
			</div>

			{streamKamera && (
				<div className="pointer-events-none fixed bottom-3 left-3 z-40 h-14 w-[72px] overflow-hidden rounded-lg border-2 border-white shadow-lg sm:h-[72px] sm:w-24">
					<PratinjauKamera stream={streamKamera} className="h-full w-full" />
					<span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
						Dipantau
					</span>
				</div>
			)}

			{(keluarFullscreen || kameraPutus || layarPutus) && (
				<div className="fixed inset-0 z-[9990] flex items-center justify-center bg-[#7f1d1d]/90 px-4">
					<div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
						<h2 className="text-[17px] font-semibold text-[#16233f]">Kembali ke ujian</h2>
						<p className="mt-2 text-[13.5px] leading-6 text-[#5b5490]">
							Alarm berhenti setelah semua syarat di bawah terpenuhi. Waktu ujian tetap berjalan.
						</p>

						<div className="mt-4 flex flex-col gap-2">
							{keluarFullscreen && (
								<button
									type="button"
									onClick={() => void document.documentElement.requestFullscreen().catch(() => {})}
									className="rounded-[10px] bg-[#4338ca] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#3730a3]"
								>
									Kembali ke layar penuh
								</button>
							)}
							{kameraPutus && (
								<button
									type="button"
									onClick={() => void aktifkanKamera()}
									className="rounded-[10px] bg-[#4338ca] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#3730a3]"
								>
									Aktifkan kamera lagi
								</button>
							)}
							{layarPutus && (
								<button
									type="button"
									onClick={() => void bagikanLayar()}
									className="rounded-[10px] bg-[#4338ca] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#3730a3]"
								>
									Bagikan layar lagi
								</button>
							)}
						</div>

						{pesanKamera && kameraPutus && <p className="mt-3 text-[12px] leading-5 text-[#d23b3b]">{pesanKamera}</p>}
						{pesanLayar && layarPutus && <p className="mt-3 text-[12px] leading-5 text-[#d23b3b]">{pesanLayar}</p>}
					</div>
				</div>
			)}

			<PeringatanModal
				open={modal !== null}
				tipe={modal}
				jumlahPelanggaran={jumlahPelanggaran}
				batasPelanggaran={batasPelanggaran}
				onTutup={() => {
					setModal(null)
					if (jumlahPelanggaran >= batasPelanggaran) {
						router.push("/beranda-peserta")
						return
					}
					// Klik ini adalah gestur pengguna, jadi boleh masuk fullscreen lagi.
					if (wajibFullscreen.current && !document.fullscreenElement) {
						void document.documentElement.requestFullscreen().catch(() => {})
					}
				}}
			/>
		</>
	)
}