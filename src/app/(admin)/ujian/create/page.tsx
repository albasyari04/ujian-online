import { FormUjian } from "@/components/admin/FormUjian"

export default function CreateUjianPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#241f4d]">Buat ujian</h1>
        <p className="text-[13px] text-[#8b87a8]">Lengkapi detail ujian di bawah ini.</p>
      </div>

      <FormUjian />
    </div>
  )
}