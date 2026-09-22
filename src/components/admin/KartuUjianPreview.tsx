import Image from "next/image"

type KartuData = {
  id: string
  nama: string
  email: string
  nisn: string | null
  noUrut: number | null
  password: string
}

export function KartuUjianPreview({ data }: { data: KartuData }) {
  return (
    <div className="kartu-ujian relative overflow-hidden rounded-[12px] border-2 border-[#003868] bg-white p-4 shadow-[0_4px_12px_rgba(0,32,63,0.15)] print:break-inside-avoid">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-dashed border-[#003868]/30 pb-3">
        <Image
          src="/image/ujian-online.png"
          alt="Logo"
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold uppercase tracking-wide text-[#003868]">
            Kartu Ujian
          </p>
          <p className="text-[10px] text-[#5b657d]">Ujian Online Sekolah</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003868] text-[13px] font-bold text-white">
          {data.noUrut ?? "-"}
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 space-y-2 text-[11px]">
        <Row label="Nama" value={data.nama} />
        <Row label="NISN" value={data.nisn ?? "-"} />
        <Row label="Email" value={data.email} />
        <div className="rounded-[6px] bg-[#eef6ff] px-2.5 py-1.5">
          <p className="text-[9.5px] font-medium uppercase tracking-wide text-[#007fc4]">
            Password
          </p>
          <p className="font-mono text-[13px] font-bold tracking-wider text-[#003868]">
            {data.password}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-dashed border-[#003868]/30 pt-2 text-center">
        <p className="text-[9px] text-[#8b93a6]">
          Simpan kartu ini dengan baik. Jangan bagikan password kepada orang lain.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-14 shrink-0 text-[10px] font-medium text-[#8b93a6]">{label}</span>
      <span className="min-w-0 flex-1 break-words font-medium text-[#16233f]">{value}</span>
    </div>
  )
}