import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { Card } from "@/components/ui/Card"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export default async function PengaturanPesertaPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/login")

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309] dark:text-[#e8a33d]">Portal Peserta</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f] dark:text-white">Pengaturan</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86] dark:text-white/60">
          Kelola preferensi dan keamanan akun Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Informasi akun</h2>
          <p className="mt-1 text-[12.5px] text-[#8b93a6] dark:text-white/50">
            Perbarui nama, email, dan kata sandi Anda.
          </p>
          <Link
            href="/profil"
            className="mt-4 inline-flex rounded-[10px] bg-[#16233f] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#1f2f52]"
          >
            Buka profil saya
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Tampilan</h2>
          <p className="mt-1 text-[12.5px] text-[#8b93a6] dark:text-white/50">
            Pilih tema terang, gelap, atau ikuti pengaturan perangkat Anda.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Keamanan ujian</h2>
          <div className="mt-4 divide-y divide-[#edf0ef] dark:divide-white/10">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <div>
                <p className="text-[13px] font-medium text-[#34435f] dark:text-white/80">
                  Pencatatan pelanggaran
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/50">
                  Aktif selama sesi ujian.
                </p>
              </div>
              <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-medium text-[#047857] dark:bg-emerald-400/10 dark:text-emerald-300">
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between py-3 last:pb-0">
              <div>
                <p className="text-[13px] font-medium text-[#34435f] dark:text-white/80">
                  Penyimpanan jawaban
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/50">
                  Jawaban disimpan otomatis.
                </p>
              </div>
              <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-medium text-[#047857] dark:bg-emerald-400/10 dark:text-emerald-300">
                Aktif
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
