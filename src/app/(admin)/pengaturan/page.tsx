import { Card } from "@/components/ui/Card"
import { getPengaturanPelanggaran } from "@/lib/pengaturan"
import { PengaturanPelanggaranForm } from "@/components/admin/PengaturanPelanggaranForm"
import { PengaturanTampilanForm } from "@/components/admin/PengaturanTampilanForm"

export default async function PengaturanPage() {
	const pengaturanPelanggaran = await getPengaturanPelanggaran()

	return (
		<div className="flex flex-col gap-6">
			<div>
				<p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p>
				<h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Pengaturan</h1>
				<p className="mt-1 text-[13px] text-[#5b657d]">Kelola informasi akun dan konfigurasi dasar panel admin.</p>
			</div>
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<Card className="p-5">
					<h2 className="text-[15px] font-semibold text-[#16233f]">Konfigurasi ujian</h2>
					<div className="mt-4 divide-y divide-[#edf0ef]">
						<div className="flex items-center justify-between py-3 first:pt-0"><div><p className="text-[13px] font-medium text-[#34435f]">Pencatatan pelanggaran</p><p className="mt-0.5 text-[11.5px] text-[#8b93a6]">Dipantau pada setiap sesi ujian.</p></div><span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-medium text-[#047857]">Aktif</span></div>
						<div className="flex items-center justify-between py-3"><div><p className="text-[13px] font-medium text-[#34435f]">Penyimpanan jawaban</p><p className="mt-0.5 text-[11.5px] text-[#8b93a6]">Jawaban tersimpan otomatis.</p></div><span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-medium text-[#047857]">Aktif</span></div>
					</div>
				</Card>
				<Card className="p-5">
					<h2 className="text-[15px] font-semibold text-[#16233f]">Tampilan</h2>
					<p className="mt-1 text-[11.5px] text-[#8b93a6]">Pilih tema tampilan panel admin.</p>
					<PengaturanTampilanForm />
				</Card>
			</div>
			<Card className="relative overflow-hidden border-[#dfe5e2] p-5 shadow-[0_12px_28px_-20px_rgba(6,78,59,0.45),0_4px_0_#edf1ee] transition-shadow hover:shadow-[0_18px_32px_-20px_rgba(6,78,59,0.42),0_5px_0_#e7ece9]">
				<span className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f2faf6] to-transparent" />
				<h2 className="text-[15px] font-semibold text-[#16233f]">Pengaturan pelanggaran ujian</h2>
				<PengaturanPelanggaranForm pengaturanAwal={pengaturanPelanggaran} />
			</Card>
		</div>
	)
}