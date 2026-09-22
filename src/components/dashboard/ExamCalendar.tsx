const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export function ExamCalendar({
  month,
  examDays,
  today,
}: {
  /** Tanggal apa saja (di dalam bulan `month`) yang berisi ujian */
  examDays: number[]
  /** Bulan yang ditampilkan (tanggal berapa pun di bulan tsb) */
  month: Date
  /** Tanggal hari ini, untuk menyorot sel "hari ini" */
  today: Date
}) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()
  const totalDays = new Date(year, monthIndex + 1, 0).getDate()

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex
  const todayDate = isCurrentMonth ? today.getDate() : -1

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-[#16233f]">
          {NAMA_BULAN[monthIndex]} {year}
        </p>
        <span className="flex h-2 w-2 rounded-full bg-[#007fc4] shadow-[0_0_7px_rgba(0,127,196,0.65)]" aria-hidden="true" />
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
        {HARI.map((hari) => (
          <span key={hari} className="text-[10.5px] font-medium text-[#94a3b8]">
            {hari}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`kosong-${index}`} />
          }

          const isToday = day === todayDate
          const hasExam = examDays.includes(day)

          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <span
                title={hasExam ? "Ada ujian pada tanggal ini" : undefined}
                className={`
                  flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-medium transition-colors
                  ${isToday ? "bg-gradient-to-br from-[#003868] to-[#007fc4] text-white shadow-[0_4px_10px_rgba(0,56,104,0.4)]" : ""}
                  ${!isToday && hasExam ? "bg-[#d9f4ff] text-[#00679e]" : ""}
                  ${!isToday && !hasExam ? "text-[#34435f]" : ""}
                `}
              >
                {day}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[10.5px] text-[#8b93a6]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#003868] to-[#007fc4]" /> Hari ini
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#d9f4ff] ring-1 ring-inset ring-[#62bde5]" /> Ada ujian
        </span>
      </div>
    </div>
  )
}