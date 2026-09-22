import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { FormUjian } from "@/components/admin/FormUjian"

export default async function EditUjianPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ujian = await prisma.ujian.findUnique({ where: { id } })

  if (!ujian) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#241f4d]">Edit ujian</h1>
        <p className="text-[13px] text-[#8b87a8]">Perbarui detail ujian &quot;{ujian.judul}&quot;.</p>
      </div>

      <FormUjian initialData={ujian} />
    </div>
  )
}