// Catatan: sesuaikan path import ThemeToggle di bawah dengan lokasi
// file ThemeToggle.tsx yang sebenarnya di proyek Anda (mis. jika ada
// di src/components/ThemeToggle.tsx, ubah menjadi "@/components/ThemeToggle").
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Card } from "@/components/ui/Card"

export default function PengaturanGuruPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#16233f] dark:text-white">Pengaturan</h1>
        <p className="mt-0.5 text-[13px] text-[#5b657d] dark:text-white/50">Sesuaikan tampilan portal guru.</p>
      </div>

      <Card className="max-w-xl p-5">
        <h2 className="text-[14px] font-semibold text-[#16233f] dark:text-white">Tema Tampilan</h2>
        <p className="mt-1 text-[12.5px] text-[#8b93a6] dark:text-white/40">
          Pilih tampilan terang, gelap, atau ikuti pengaturan sistem.
        </p>
        <div className="mt-3">
          <ThemeToggle />
        </div>
      </Card>
    </div>
  )
}
