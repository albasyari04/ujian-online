import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { Card } from "@/components/ui/Card"
import { FaqAccordion, type FaqItem } from "@/components/bantuan/FaqAccordion"

/* =========================================================
   IKON LOKAL
   Belum ada di components/ui/Icons.tsx, jadi didefinisikan
   lokal di sini agar konsisten secara visual dengan ikon lain
   (sama seperti pola IconRiwayat di halaman riwayat).
========================================================= */

function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7L12 12.5L19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6.5 17.5L4.5 20L7.1 19C8.4 19.8 9.9 20.2 11.5 20.2C16.3 20.2 20 16.5 20 11.9C20 7.3 16.3 3.5 11.7 3.5C7.1 3.5 3.5 7.2 3.5 11.8C3.5 13.6 4 15.2 5 16.5L6.5 17.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.8C9 10.8 9.3 12.2 10.5 13.4C11.7 14.6 13.1 14.9 13.1 14.9C13.5 14.9 14.3 14 14.1 13.6C13.9 13.2 12.9 12.7 12.7 12.7C12.5 12.7 12.4 12.9 12.1 13.2C11.9 13.4 11.6 13.3 11.2 13.1C10.6 12.8 10.1 12.2 9.8 11.6C9.6 11.2 9.6 10.9 9.8 10.7C10.1 10.4 10.3 10.3 10.3 10.1C10.3 9.9 9.8 8.9 9.4 8.7C9 8.5 8.2 9.3 8.2 9.7C8.2 10 8.4 10.4 9 10.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconClockOperasional({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12.2L15.2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 3.5L19 6V11.5C19 15.9 16 19.2 12 20.5C8 19.2 5 15.9 5 11.5V6L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12L11.2 14.2L15.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* =========================================================
   DATA FAQ
   Belum ada model FAQ di schema.prisma, jadi daftar berikut
   didefinisikan statis di sini. Kalau nanti ingin dikelola dari
   panel admin, tinggal ganti array ini dengan query Prisma
   (mis. model FaqItem baru) tanpa mengubah tampilan di bawah.
========================================================= */

const daftarFaq: FaqItem[] = [
  {
    id: "login",
    kategori: "Akun & Login",
    pertanyaan: "Bagaimana cara masuk ke akun peserta?",
    jawaban:
      "Gunakan email dan kata sandi yang diberikan oleh admin akademik pada halaman Login. Jika belum pernah menerima kredensial akun, hubungi admin melalui kontak di bawah.",
  },
  {
    id: "lupa-sandi",
    kategori: "Akun & Login",
    pertanyaan: "Saya lupa kata sandi, bagaimana cara mereset-nya?",
    jawaban:
      "Saat ini reset kata sandi dilakukan oleh admin secara manual. Hubungi tim dukungan melalui email atau WhatsApp di bawah dengan menyertakan nama lengkap dan email akun Anda.",
  },
  {
    id: "ganti-profil",
    kategori: "Akun & Login",
    pertanyaan: "Di mana saya bisa mengubah nama atau email akun?",
    jawaban:
      "Buka menu Profil Saya di sidebar, lalu perbarui data pada formulir yang tersedia. Perubahan akan langsung tersimpan setelah Anda menekan tombol simpan.",
  },
  {
    id: "kapan-mulai",
    kategori: "Mengerjakan Ujian",
    pertanyaan: "Kapan sebuah ujian bisa mulai saya kerjakan?",
    jawaban:
      "Setiap ujian memiliki jadwal mulai dan selesai yang ditentukan admin. Selama waktu saat ini berada di antara jadwal tersebut, ujian akan muncul di halaman Ujian Tersedia dan bisa langsung dikerjakan.",
  },
  {
    id: "acak-soal",
    kategori: "Mengerjakan Ujian",
    pertanyaan: "Apakah urutan soal bisa berbeda antar peserta?",
    jawaban:
      "Bisa. Jika admin mengaktifkan opsi acak soal pada suatu ujian, urutan pertanyaan yang Anda lihat bisa berbeda dengan peserta lain meski isi soalnya sama.",
  },
  {
    id: "lanjutkan-ujian",
    kategori: "Mengerjakan Ujian",
    pertanyaan: "Saya belum selesai mengerjakan, apakah bisa dilanjutkan?",
    jawaban:
      "Ya. Selama waktu pengerjaan belum habis, ujian dengan status 'Sedang Dikerjakan' akan tetap muncul di Beranda maupun Ujian Sedang Berlangsung — klik 'Lanjutkan Ujian' untuk melanjutkan dari posisi terakhir.",
  },
  {
    id: "pelanggaran",
    kategori: "Mengerjakan Ujian",
    pertanyaan: "Tindakan apa saja yang dianggap sebagai pelanggaran saat ujian?",
    jawaban:
      "Sistem mencatat beberapa tindakan sebagai pelanggaran, di antaranya berpindah tab, keluar dari mode layar penuh, kehilangan fokus jendela, copy-paste, klik kanan, dan membuka developer tools. Setiap ujian punya batas jumlah pelanggaran yang ditentukan admin — jika terlampaui, ujian bisa berakhir otomatis.",
  },
  {
    id: "koneksi-putus",
    kategori: "Mengerjakan Ujian",
    pertanyaan: "Koneksi internet saya putus saat ujian, apakah jawaban saya hilang?",
    jawaban:
      "Jawaban yang sudah Anda kirim tersimpan di server, bukan hanya di perangkat Anda. Login kembali dan buka ujian yang sama untuk melanjutkan dari jawaban terakhir yang tersimpan.",
  },
  {
    id: "kapan-nilai",
    kategori: "Nilai & Hasil",
    pertanyaan: "Kapan saya bisa melihat nilai ujian saya?",
    jawaban:
      "Untuk soal pilihan ganda, skor biasanya langsung tersedia setelah ujian selesai. Untuk soal esai yang perlu dinilai manual oleh admin, skor akan muncul di halaman Hasil & Nilai setelah proses penilaian selesai — Anda akan menerima notifikasi saat hasil sudah tersedia.",
  },
  {
    id: "nilai-belum-keluar",
    kategori: "Nilai & Hasil",
    pertanyaan: "Nilai saya masih menunjukkan 'menunggu penilaian', apa artinya?",
    jawaban:
      "Artinya ujian tersebut berisi soal esai yang belum selesai diperiksa oleh admin. Tunggu notifikasi 'Hasil Tersedia' atau cek kembali secara berkala di halaman Riwayat Ujian.",
  },
  {
    id: "notifikasi",
    kategori: "Teknis & Kendala",
    pertanyaan: "Notifikasi apa saja yang akan saya terima di platform ini?",
    jawaban:
      "Anda akan menerima notifikasi saat ada ujian baru yang tersedia, ujian yang akan segera ditutup, hasil ujian yang sudah bisa dilihat, catatan pelanggaran selama ujian, serta pengumuman umum dari sistem.",
  },
  {
    id: "devtools",
    kategori: "Teknis & Kendala",
    pertanyaan: "Kenapa membuka developer tools browser dianggap pelanggaran?",
    jawaban:
      "Developer tools dapat digunakan untuk melihat atau memodifikasi jawaban di balik layar, sehingga sistem mendeteksi dan mencatatnya sebagai upaya kecurangan demi menjaga keadilan penilaian.",
  },
]

const tipsUjian = [
  "Pastikan koneksi internet stabil sebelum memulai ujian.",
  "Gunakan mode layar penuh dan hindari berpindah tab selama mengerjakan.",
  "Jangan menutup atau me-refresh browser secara tiba-tiba.",
  "Perhatikan sisa waktu dan batas pelanggaran yang ditampilkan di layar ujian.",
]

/* =========================================================
   HALAMAN
========================================================= */

export default async function BantuanPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309]">Pusat bantuan</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Bantuan</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86]">
          Temukan jawaban seputar akun, cara mengerjakan ujian, dan nilai. Belum menemukan
          jawabannya? Hubungi tim dukungan kami.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===================== KOLOM UTAMA — FAQ ===================== */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-5">
            <FaqAccordion items={daftarFaq} />
          </Card>
        </div>

        {/* ===================== PANEL KANAN ===================== */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-5">
            <div>
              <p className="text-[13.5px] font-semibold text-[#16233f]">Masih butuh bantuan?</p>
              <p className="mt-1 text-[12.5px] text-[#8b93a6]">
                Tim kami siap membantu kendala akun maupun teknis seputar ujian.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Sesuaikan alamat email dan nomor WhatsApp di bawah dengan kontak tim Anda */}
              <a
                href="mailto:dukungan@ujianonline.id"
                className="flex items-center gap-3 rounded-[12px] border border-[#e7e4dc] px-3.5 py-3 transition-colors hover:bg-[#f6f4ec]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#059669] to-[#10b981] text-white shadow-[0_3px_8px_rgba(5,150,105,0.3)]">
                  <IconMail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#16233f]">Email</p>
                  <p className="truncate text-[12px] text-[#8b93a6]">dukungan@ujianonline.id</p>
                </div>
              </a>

              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-[12px] border border-[#e7e4dc] px-3.5 py-3 transition-colors hover:bg-[#f6f4ec]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3457c9] to-[#5b7ce0] text-white shadow-[0_3px_8px_rgba(52,87,201,0.3)]">
                  <IconWhatsapp className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#16233f]">WhatsApp</p>
                  <p className="truncate text-[12px] text-[#8b93a6]">+62 812-3456-7890</p>
                </div>
              </a>

              <div className="flex items-center gap-3 rounded-[12px] border border-[#e7e4dc] px-3.5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#b8863b] to-[#d3a25c] text-white shadow-[0_3px_8px_rgba(184,134,59,0.3)]">
                  <IconClockOperasional className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#16233f]">Jam layanan</p>
                  <p className="text-[12px] text-[#8b93a6]">Senin–Jumat, 08.00–16.00 WIB</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#fdf6e7] text-[#b45309]">
                <IconShield className="h-4 w-4" />
              </span>
              <p className="text-[13.5px] font-semibold text-[#16233f]">Tips agar ujian lancar</p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {tipsUjian.map((tips, index) => (
                <li key={tips} className="flex items-start gap-2.5 text-[12.5px] text-[#5b6a86]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fdf6e7] text-[10px] font-semibold text-[#b45309]">
                    {index + 1}
                  </span>
                  <span className="leading-5">{tips}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}