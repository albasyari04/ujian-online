import Link from "next/link"
import Image from "next/image"

import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import { HapusButton } from "@/components/admin/HapusButton"
import { IconChevronRight, IconDocument, IconPencil, IconPlus } from "@/components/ui/Icons"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import {
  formatTanggalWaktu,
  LABEL_STATUS_RUNTIME,
  statusRuntimeUjian,
  WARNA_STATUS_RUNTIME,
} from "@/lib/ujian-utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UjianPage() {
  const daftarUjian = await prisma.ujian.findMany({
    include: {
      _count: { select: { soal: true, hasilUjian: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8863b] dark:text-[#e0b374] sm:text-[12px]">
            Ujian Online
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#241f4d] dark:text-white sm:text-[26px]">
            Kelola Ujian
          </h1>
          <p className="mt-1 text-[12px] text-[#8b87a8] dark:text-white/50 sm:text-[13px]">
            Buat, ubah, dan pantau seluruh ujian di sini.
          </p>
        </div>
        <Link
          href="/ujian/create"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[12px] border border-white/10 bg-gradient-to-r from-[#4338ca] to-[#6d5ce8] px-3 py-2 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_16px_-8px_rgba(67,56,202,0.8)] transition hover:-translate-y-0.5 hover:brightness-105 sm:px-4 sm:py-2.5 sm:text-[13px]"
        >
          <IconPlus className="h-4 w-4" />
          <span>Tambah ujian</span>
        </Link>
      </div>

      {daftarUjian.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <IconDocument className="mx-auto h-10 w-10 text-[#c1b8f2] dark:text-white/20" />
          <p className="mt-3 text-[14px] font-medium text-[#241f4d] dark:text-white">Belum ada ujian</p>
          <p className="mt-1 text-[12.5px] text-[#8b87a8] dark:text-white/40">
            Klik &quot;Tambah ujian&quot; untuk membuat ujian pertama Anda.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {daftarUjian.map((ujian) => {
            const status = statusRuntimeUjian(ujian.mulai, ujian.selesai)
            const iconSrc = getSubjectIconSrc(ujian.judul)

            return (
              <Card
                key={ujian.id}
                className="group relative flex flex-col overflow-hidden border-[#e6e3f7] p-5 shadow-[0_10px_24px_-18px_rgba(37,26,110,0.4),0_4px_0_#f5f4fb] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_-18px_rgba(37,26,110,0.45),0_5px_0_#ecebfa] dark:border-white/10 dark:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_18px_32px_-18px_rgba(0,0,0,0.55)]"
              >
                <span className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[60px] bg-gradient-to-bl from-[#ece9fe] to-transparent opacity-80 dark:from-white/[0.06]" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
                      <Image
                        src={iconSrc}
                        alt={ujian.judul}
                        width={64}
                        height={64}
                        className="h-14 w-14 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)]"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6fce] dark:text-[#a5b4fc]">
                        Ujian
                      </p>
                      <h2 className="mt-1 truncate text-[16.5px] font-semibold text-[#241f4d] dark:text-white">
                        {ujian.judul}
                      </h2>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${WARNA_STATUS_RUNTIME[status]}`}
                  >
                    {LABEL_STATUS_RUNTIME[status]}
                  </span>
                </div>

                {ujian.deskripsi && (
                  <p className="relative mt-3 line-clamp-2 text-[12.5px] text-[#8b87a8] dark:text-white/50">
                    {ujian.deskripsi}
                  </p>
                )}

                <p className="relative mt-3 text-[11.5px] text-[#8b87a8] dark:text-white/40">
                  {formatTanggalWaktu(ujian.mulai)} <span className="mx-1">→</span> {formatTanggalWaktu(ujian.selesai)}
                </p>

                <div className="relative mt-4 grid grid-cols-3 gap-2.5">
                  <div className="flex flex-col items-center gap-1.5 rounded-[12px] border border-[#ece9fa] bg-[#faf9ff] px-2 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-white to-[#f1effc] shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_4px_10px_-5px_rgba(67,56,202,0.4)] dark:from-white/10 dark:to-white/5 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_10px_-5px_rgba(0,0,0,0.5)] sm:h-11 sm:w-11">
                      <Image src="/image/icon/durasi-icon.png" alt="" width={32} height={32} className="h-6 w-6 object-contain sm:h-7 sm:w-7" />
                    </span>
                    <p className="text-[13px] font-semibold text-[#241f4d] dark:text-white">{ujian.durasiMenit}′</p>
                    <p className="text-[10px] text-[#a29cc4] dark:text-white/40">Durasi</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-[12px] border border-[#ece9fa] bg-[#faf9ff] px-2 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-white to-[#f1effc] shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_4px_10px_-5px_rgba(67,56,202,0.4)] dark:from-white/10 dark:to-white/5 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_10px_-5px_rgba(0,0,0,0.5)] sm:h-11 sm:w-11">
                      <Image src="/image/icon/soal-icon.png" alt="" width={32} height={32} className="h-6 w-6 object-contain sm:h-7 sm:w-7" />
                    </span>
                    <p className="text-[13px] font-semibold text-[#241f4d] dark:text-white">{ujian._count.soal}</p>
                    <p className="text-[10px] text-[#a29cc4] dark:text-white/40">Soal</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-[12px] border border-[#ece9fa] bg-[#faf9ff] px-2 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-white to-[#f1effc] shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_4px_10px_-5px_rgba(67,56,202,0.4)] dark:from-white/10 dark:to-white/5 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_10px_-5px_rgba(0,0,0,0.5)] sm:h-11 sm:w-11">
                      <Image src="/image/icon/peserta-icon.png" alt="" width={32} height={32} className="h-6 w-6 object-contain sm:h-7 sm:w-7" />
                    </span>
                    <p className="text-[13px] font-semibold text-[#241f4d] dark:text-white">{ujian._count.hasilUjian}</p>
                    <p className="text-[10px] text-[#a29cc4] dark:text-white/40">Peserta</p>
                  </div>
                </div>

                <div className="relative mt-5 flex items-center justify-between border-t border-[#f1f0f8] pt-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-1">
                    <Link
                      href={`/ujian/${ujian.id}/soal`}
                      className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1.5 text-[12px] font-medium text-[#4338ca] hover:bg-[#f2f1fc] dark:text-[#a5b4fc] dark:hover:bg-white/10"
                    >
                      Soal <IconChevronRight className="h-3 w-3" />
                    </Link>
                    <Link
                      href={`/ujian/${ujian.id}/hasil`}
                      className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1.5 text-[12px] font-medium text-[#4338ca] hover:bg-[#f2f1fc] dark:text-[#a5b4fc] dark:hover:bg-white/10"
                    >
                      Hasil <IconChevronRight className="h-3 w-3" />
                    </Link>
                    <Link
                      href={`/ujian/${ujian.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1.5 text-[12px] font-medium text-[#4338ca] hover:bg-[#f2f1fc] dark:text-[#a5b4fc] dark:hover:bg-white/10"
                    >
                      <IconPencil className="h-3 w-3" /> Edit
                    </Link>
                  </div>
                  <HapusButton
                    url={`/api/ujian/${ujian.id}`}
                    konfirmasi={`Hapus ujian "${ujian.judul}"? Tindakan ini tidak dapat dibatalkan.`}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}