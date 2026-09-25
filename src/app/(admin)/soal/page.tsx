import Image from "next/image"
import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { IconBook, IconChevronRight, IconPlus } from "@/components/ui/Icons"
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

export default async function BankSoalPage() {
  const [soal, totalSoal, totalUjian] = await Promise.all([
    prisma.soal.findMany({
      orderBy: [{ ujian: { judul: "asc" } }, { urutan: "asc" }],
      include: {
        ujian: { select: { id: true, judul: true } },
      },
    }),
    prisma.soal.count(),
    prisma.ujian.count(),
  ])

  const pilihanGanda = soal.filter((item) => item.tipe === "PILIHAN_GANDA").length
  const essay = soal.filter((item) => item.tipe === "ESSAY").length
  const kelompok = Array.from(
    soal.reduce((map, item) => {
      const current = map.get(item.ujian.id) ?? {
        id: item.ujian.id,
        judul: item.ujian.judul,
        soal: [],
        pilihanGanda: 0,
        essay: 0,
      }
      current.soal.push(item)
      if (item.tipe === "PILIHAN_GANDA") current.pilihanGanda += 1
      else current.essay += 1
      map.set(item.ujian.id, current)
      return map
    }, new Map<string, { id: string; judul: string; soal: typeof soal; pilihanGanda: number; essay: number }>()).values(),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8863b] sm:text-[12px]">
            Ujian Online
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#16233f] dark:text-white sm:text-[26px]">
            Bank Soal
          </h1>
          <p className="mt-1 text-[12px] text-[#5b657d] dark:text-white/50 sm:text-[13px]">
            Kelola dan tinjau soal yang digunakan dalam setiap ujian.
          </p>
        </div>
        <Link
          href="/ujian"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[12px] border border-white/10 bg-gradient-to-r from-[#007fc4] to-[#00a7ff] px-3 py-2 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_16px_-8px_rgba(0,126,196,0.8)] transition hover:-translate-y-0.5 hover:brightness-105 sm:px-4 sm:py-2.5 sm:text-[13px]"
        >
          <IconPlus className="h-4 w-4" />
          <span>Kelola mata pelajaran</span>
        </Link>
      </div>

      {/*
        StatCard dengan `iconImageSrc` merender icon POLOS
        (tanpa card/box/lingkaran di belakangnya), sesuai
        icon 3D yang sudah disediakan.
      */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Soal"
          value={totalSoal}
          iconImageSrc="/image/icon/total-ujian-icon.png"
          tone="emerald"
        />
        <StatCard
          label="Pilihan Ganda"
          value={pilihanGanda}
          iconImageSrc="/image/icon/pilihan-ganda-icon.png"
          tone="blue"
        />
        <StatCard label="Essay" value={essay} iconImageSrc="/image/icon/esai-icon.png" tone="slate" />
        <StatCard
          label="Ujian Terhubung"
          value={totalUjian}
          iconImageSrc="/image/icon/ujian-terhubung-icon.png"
          tone="amber"
        />
      </div>

      {kelompok.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <IconBook className="mx-auto h-10 w-10 text-[#8bc8e5]" />
          <p className="mt-3 text-[14px] font-medium text-[#16233f] dark:text-white">
            Belum ada kelompok mata pelajaran
          </p>
          <p className="mt-1 text-[12.5px] text-[#8b93a6] dark:text-white/40">
            Buat ujian terlebih dahulu, lalu tambahkan soal ke dalamnya.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {kelompok.map((group) => {
            const iconSrc = getSubjectIconSrc(group.judul)
            return (
              <Card
                key={group.id}
                className="group relative overflow-hidden border-[#dce7ee] p-5 shadow-[0_10px_24px_-18px_rgba(0,56,104,0.55),0_4px_0_#edf4f8] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_30px_-18px_rgba(0,56,104,0.6),0_5px_0_#e5f1f7] dark:border-white/10 dark:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.55),0_4px_0_rgba(255,255,255,0.03)] dark:hover:shadow-[0_18px_30px_-18px_rgba(0,0,0,0.65),0_5px_0_rgba(255,255,255,0.04)]"
              >
                <span className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[60px] bg-gradient-to-bl from-[#d9f4ff] to-transparent opacity-80 dark:from-white/10" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
                      <Image
                        src={iconSrc}
                        alt={group.judul}
                        width={64}
                        height={64}
                        className="h-14 w-14 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)]"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#007fc4] dark:text-[#63c2f5]">
                        Mata pelajaran
                      </p>
                      <h2 className="mt-1 truncate text-[17px] font-semibold text-[#003868] dark:text-white">
                        {group.judul}
                      </h2>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#bde3f2] bg-[#effaff] px-2.5 py-1 text-[11px] font-semibold text-[#0074ad] dark:border-white/10 dark:bg-white/10 dark:text-[#8fd4ff]">
                    {group.soal.length} soal
                  </span>
                </div>
                <div className="relative mt-5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-[12px] border border-[#dce7ee] bg-[#f7fbfd] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[18px] font-semibold text-[#003868] dark:text-white">{group.pilihanGanda}</p>
                    <p className="text-[11px] text-[#7c91a1] dark:text-white/40">Pilihan ganda</p>
                  </div>
                  <div className="rounded-[12px] border border-[#dce7ee] bg-[#f7fbfd] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[18px] font-semibold text-[#003868] dark:text-white">{group.essay}</p>
                    <p className="text-[11px] text-[#7c91a1] dark:text-white/40">Essay</p>
                  </div>
                </div>
                <div className="relative mt-5 flex items-center justify-between border-t border-[#e8f0f4] pt-4 dark:border-white/10">
                  <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">
                    CRUD soal tersedia di halaman mata pelajaran
                  </p>
                  <Link
                    href={`/ujian/${group.id}/soal`}
                    className="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#007fc4] to-[#00a7ff] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_7px_13px_-8px_rgba(0,126,196,0.8)] transition hover:-translate-y-0.5"
                  >
                    Kelola <IconChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}