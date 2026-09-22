/**
 * Path ikon 3D per mata pelajaran, disimpan di public/image/icon/*.png.
 * Fungsi ini mencocokkan judul ujian/mata pelajaran ke ikon yang paling sesuai.
 * Kalau tidak ada yang cocok, jatuh ke ikon dokumen generik.
 */

const ICON_BASE = "/image/icon"
const DEFAULT_ICON = "dockumen.png"

type SubjectIconRule = {
  match: RegExp
  icon: string
}

// Urutan penting: aturan lebih spesifik ditaruh lebih awal supaya tidak
// tertangkap oleh aturan lain yang lebih umum (mis. "informatika" mengandung
// "tik", jadi harus dicek duluan sebelum aturan \btik\b).
const SUBJECT_ICON_RULES: SubjectIconRule[] = [
  { match: /informatika|komputer/i, icon: "informatika-icon.png" },
  { match: /\btik\b/i, icon: "informatika-icon.png" },
  { match: /bahasa\s*arab|\barab\b/i, icon: "bahasa-arab-icon.png" },
  { match: /bahasa\s*indonesia|\bindo\b/i, icon: "bahasa-indo-icon.png" },
  { match: /bahasa\s*inggris|\binggris\b|\benglish\b/i, icon: "bahasa-inggris-icon.png" },
  { match: /qur.?an|tahfiz|tahfidz/i, icon: "alquran-icon.png" },
  { match: /fiqih|fiqh/i, icon: "fiqih-icon.png" },
  { match: /biologi/i, icon: "biologi-icon.png" },
  { match: /fisika/i, icon: "fisika-icon.png" },
  { match: /geografi/i, icon: "geogfrafi-icon.png" },
  { match: /\bkimia\b/i, icon: "kimia-icon.png" },
  { match: /\bkka\b/i, icon: "kka-icon.png" },
  { match: /matematika|\bmtk\b|\bmath\b/i, icon: "mtk-icon.png" },
  { match: /ppkn|\bpkn\b|kewarganegaraan/i, icon: "ppkn-icon.png" },
  { match: /sejarah/i, icon: "sejarah-icon.png" },
  { match: /seni\s*budaya|\bseni\b/i, icon: "seni-budaya-icon.png" },
  { match: /sosiologi/i, icon: "sosiologi-icon.png" },
]

export function getSubjectIconSrc(judul: string): string {
  const rule = SUBJECT_ICON_RULES.find((r) => r.match.test(judul))
  return `${ICON_BASE}/${rule?.icon ?? DEFAULT_ICON}`
}