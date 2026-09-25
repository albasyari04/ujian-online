import { Card } from "@/components/ui/Card"
import { getPengaturanPelanggaran } from "@/lib/pengaturan"
import { PengaturanPelanggaranForm } from "@/components/admin/PengaturanPelanggaranForm"
import { PengaturanTampilanForm } from "@/components/admin/PengaturanTampilanForm"

/* Ikon SVG inline sederhana — dibuat lokal di file ini (bukan dari
   Icons.tsx) supaya tidak bergantung pada nama icon yang belum tentu
   tersedia di project. Dipakai sebagai badge kecil 3D di tiap header
   card agar tampilan lebih profesional & modern. */

function IconGear({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 13.5a1.7 1.7 0 0 0 .35 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.35 1.7 1.7 0 0 0-1.05 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.05-1.56 1.7 1.7 0 0 0-1.87.35l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .35-1.87 1.7 1.7 0 0 0-1.56-1.05H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.05 1.7 1.7 0 0 0-.35-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.35H10.5a1.7 1.7 0 0 0 1.05-1.56V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.05 1.56 1.7 1.7 0 0 0 1.87-.35l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.35 1.87v.13a1.7 1.7 0 0 0 1.56 1.05H19.5a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.05Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPalette({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3C7.03 3 3 6.8 3 11.5c0 3.6 3 5.5 5.5 5.5.6 0 1-.45 1-1 0-.28-.1-.5-.28-.7-.18-.2-.28-.42-.28-.7 0-.55.45-1 1-1H12c3.87 0 7-2.9 7-6.6C19 4.95 15.87 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" />
      <circle cx="10.5" cy="7" r="1.1" fill="currentColor" />
      <circle cx="14.5" cy="7.3" r="1.1" fill="currentColor" />
      <circle cx="16.5" cy="10.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

function IconShieldAlert({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 5 6v5.2c0 4.6 3 7.7 7 8.8 4-1.1 7-4.2 7-8.8V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 8.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15.2" r="0.9" fill="currentColor" />
    </svg>
  )
}

export default async function PengaturanPage() {
  const pengaturanPelanggaran = await getPengaturanPelanggaran()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f] dark:text-white">Pengaturan</h1>
        <p className="mt-1 text-[13px] text-[#5b657d] dark:text-white/50">
          Kelola informasi akun dan konfigurasi dasar panel admin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Card 3D: gradient permukaan + bayangan berlapis + glare atas,
            konsisten dengan gaya StatCard yang sudah diterapkan di
            halaman lain. */}
        <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_0_#e3e7ee,0_20px_32px_-16px_rgba(22,35,63,0.38)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_0_#0d1424,0_16px_28px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_0_#0d1424,0_22px_34px_-16px_rgba(0,0,0,0.68)]">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.55)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <IconGear />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Konfigurasi ujian</h2>
              <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                Status fitur inti yang berjalan otomatis.
              </p>
            </div>
          </div>

          <div className="relative mt-4 divide-y divide-[#edf0ef] dark:divide-white/10">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <div>
                <p className="text-[13px] font-medium text-[#34435f] dark:text-white">Pencatatan pelanggaran</p>
                <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                  Dipantau pada setiap sesi ujian.
                </p>
              </div>
              <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-medium text-[#047857] shadow-[0_2px_6px_-2px_rgba(4,120,87,0.35)] dark:bg-[#047857]/20 dark:text-[#6ee7b7]">
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-[13px] font-medium text-[#34435f] dark:text-white">Penyimpanan jawaban</p>
                <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">Jawaban tersimpan otomatis.</p>
              </div>
              <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-medium text-[#047857] shadow-[0_2px_6px_-2px_rgba(4,120,87,0.35)] dark:bg-[#047857]/20 dark:text-[#6ee7b7]">
                Aktif
              </span>
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_0_#e3e7ee,0_20px_32px_-16px_rgba(22,35,63,0.38)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_0_#0d1424,0_16px_28px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_0_#0d1424,0_22px_34px_-16px_rgba(0,0,0,0.68)]">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#93c5fd] to-[#2563eb] text-white shadow-[0_8px_16px_-6px_rgba(37,99,235,0.5)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <IconPalette />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Tampilan</h2>
              <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                Pilih tema tampilan panel admin.
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <PengaturanTampilanForm />
          </div>
        </Card>
      </div>

      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-20px_rgba(6,78,59,0.45),0_4px_0_#eef0f4] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_32px_-20px_rgba(6,78,59,0.42),0_5px_0_#e3e7ee] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_-20px_rgba(0,0,0,0.6),0_4px_0_#0d1424] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_32px_-20px_rgba(0,0,0,0.68),0_5px_0_#0d1424]">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f2faf6] to-transparent dark:from-[#047857]/10"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#fca5a5] to-[#b52f2f] text-white shadow-[0_8px_16px_-6px_rgba(181,47,47,0.5)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
            <IconShieldAlert />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Pengaturan pelanggaran ujian</h2>
            <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
              Atur ambang batas dan tindakan otomatis saat pelanggaran terdeteksi.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <PengaturanPelanggaranForm pengaturanAwal={pengaturanPelanggaran} />
        </div>
      </Card>
    </div>
  )
}