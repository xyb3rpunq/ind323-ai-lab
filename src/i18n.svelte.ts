/**
 * Dwibahasa Indonesia dan Inggris.
 *
 * # Kenapa kamusnya objek biasa, bukan berkas yang diambil saat berjalan
 *
 * Karena seluruh teksnya masuk ke dalam bundel, sehingga pergantian bahasa
 * terjadi seketika tanpa satu pun permintaan jaringan. Berkas terjemahan yang
 * diambil saat diminta akan membuat pergantian bahasa terasa seperti memuat
 * halaman baru — dan gagal sama sekali kalau jaringannya putus.
 *
 * # Kenapa pasangan, bukan kunci yang dicari
 *
 * Karena `bi("Materi", "Material")` menuntut kedua bahasa ditulis di tempat
 * yang sama. Kamus berbasis kunci — `t("nav.materi")` — membiarkan terjemahan
 * yang hilang lolos sebagai teks kosong atau sebagai kuncinya sendiri, dan
 * yang hilang selalu bahasa yang tidak dipakai penulisnya sehari-hari.
 *
 * .Deckyx
 */

/** Bahasa yang didukung. */
export type Lang = "id" | "en";

/** Sepasang teks untuk kedua bahasa. */
export type Bilingual = Readonly<Record<Lang, string>>;

const KUNCI = "ind323-ai-lab:lang";

/** Bahasa aktif. Rune, sehingga seluruh tampilan ikut berubah saat diganti. */
let sekarang = $state<Lang>("id");

/** Membaca preferensi yang tersimpan, jatuh ke bawaan bila tidak ada. */
export function pulihkanBahasa(): Lang {
  try {
    const tersimpan = localStorage.getItem(KUNCI);
    if (tersimpan === "id" || tersimpan === "en") sekarang = tersimpan;
  } catch {
    /* Penyimpanan bisa diblokir di jendela penyamaran; bawaan tetap dipakai. */
  }
  document.documentElement.lang = sekarang;
  return sekarang;
}

/** Bahasa yang sedang aktif. */
export function bahasa(): Lang {
  return sekarang;
}

/** Mengganti bahasa aktif. */
export function aturBahasa(berikut: Lang): void {
  if (berikut === sekarang) return;
  sekarang = berikut;
  // Atribut `lang` bukan hiasan: ia menentukan suara pembaca layar,
  // pemenggalan kata, dan tanda kutip yang dipilih peramban.
  document.documentElement.lang = berikut;
  try {
    localStorage.setItem(KUNCI, berikut);
  } catch {
    /* Preferensi tidak tersimpan; sesi ini tetap berganti bahasa. */
  }
}

/** Memilih teks sesuai bahasa aktif. */
export function pilih(pasangan: Bilingual): string {
  return pasangan[sekarang];
}

/** Membuat pasangan teks dwibahasa. */
export function bi(id: string, en: string): Bilingual {
  return { id, en };
}

/** Kamus teks antarmuka. */
export const T = {
  // Navigasi
  latihan: bi("Latihan", "Practice"),
  materi: bi("Materi", "Material"),
  ajar: bi("Ajar", "Teach"),
  ajarJudul: bi(
    "Salindia siap proyektor, dengan catatan pengajar",
    "Projector-ready slides, with presenter notes",
  ),
  bahasa: bi("Bahasa", "Language"),

  // Beranda
  judulBeranda: bi("Bank soal IND323 dengan pewaktu", "IND323 question bank with a timer"),
  susunSesi: bi("Susun sesi", "Build a session"),
  jumlahSoal: bi("Jumlah soal", "Number of questions"),
  tersedia: bi("tersedia", "available"),
  benihAcak: bi(
    "Benih acak — sesi dengan benih sama selalu identik",
    "Random seed — the same seed always yields an identical session",
  ),
  batasiSesi: bi("Batasi ke satu sesi kuliah", "Limit to one course session"),
  semuaSesi: bi("Semua sesi", "All sessions"),
  mulai: bi("Mulai", "Start"),
  soal: bi("soal", "questions"),

  // Hasil
  nilaiAkhir: bi("Nilai akhir", "Final score"),
  benarDari: bi("benar dari", "correct out of"),
  dikerjakanDalam: bi("dikerjakan dalam", "completed in"),
  ketepatanTopik: bi(
    "Ketepatan per topik — yang terlemah lebih dulu",
    "Accuracy per topic — weakest first",
  ),
  perluDiulang: bi("Yang perlu diulang", "Worth revisiting"),
  ulangiSesi: bi("Ulangi sesi yang sama", "Repeat the same session"),

  // Gambar
  cakupanBank: bi("Apa yang sebenarnya diuji bank ini", "What this bank actually tests"),
  kapanMuncul: bi("Kapan sebuah soal kembali muncul", "When a question comes back"),
  sebaranSesi: bi("Sebaran soal per sesi", "Questions per session"),

  // Presentasi
  keluar: bi("Keluar", "Exit"),
  daftarSesi: bi("Daftar sesi", "Session index"),
  catatan: bi("Catatan", "Notes"),
  layarPenuh: bi("Layar penuh", "Fullscreen"),
  keluarLayarPenuh: bi("Keluar layar penuh", "Exit fullscreen"),
  catatanPengajar: bi("Catatan pengajar", "Presenter notes"),
  pintasan: bi("Pintasan papan tik", "Keyboard shortcuts"),
  tutup: bi("Tutup", "Close"),
  salindiaBerikutnya: bi("Salindia berikutnya", "Next slide"),
  kendaliPresentasi: bi("Kendali presentasi", "Presentation controls"),
} as const;
