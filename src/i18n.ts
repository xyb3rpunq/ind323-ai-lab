/**
 * Dwibahasa Indonesia dan Inggris — bagian yang tidak reaktif.
 *
 * # Kenapa dipisah dari `i18n.svelte.ts`
 *
 * Karena tipe `Bilingual` dan konstruktor `bi()` tidak ada hubungannya dengan
 * reaktivitas. Selama keduanya tinggal di berkas `.svelte.ts`, setiap modul
 * yang menyentuhnya ikut menyeret rune `$state` — dan berkas rune hanya bisa
 * diurai oleh perkakas Svelte. Akibatnya nyata dan langsung terasa: `materi.ts`
 * menjadi tidak bisa diimpor Vitest sama sekali, sehingga ratusan baris materi
 * kuliah berubah menjadi kode yang tidak bisa diuji siapa pun.
 *
 * Pembagiannya sederhana. Di sini: apa saja yang hanya perlu tahu bahwa sebuah
 * teks punya dua bentuk. Di sana: bahasa mana yang sedang dipilih.
 *
 * # Kenapa pasangan, bukan kunci yang dicari
 *
 * `bi("Materi", "Material")` menuntut kedua bahasa ditulis di tempat yang sama.
 * Kamus berbasis kunci — `t("nav.materi")` — membiarkan terjemahan yang hilang
 * lolos sebagai teks kosong atau sebagai kuncinya sendiri, dan yang hilang
 * selalu bahasa yang tidak dipakai penulisnya sehari-hari. Penulisnya tidak
 * akan pernah melihatnya.
 *
 * .Deckyx
 */

/** Bahasa yang didukung. */
export type Lang = "id" | "en";

/** Sepasang teks untuk kedua bahasa. */
export type Bilingual = Readonly<Record<Lang, string>>;

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

  // Layar materi
  judulMateri: bi("Ringkasan materi per sesi", "Per-session material summary"),
  ringkasMateri: bi(
    "Bukan salinan modul. Tiap sesi diringkas menjadi satu gagasan pokok, hal " +
      "yang paling sering keliru dipahami, dan apa yang sebenarnya diuji.",
    "Not a copy of the lecture slides. Each session is reduced to one core " +
      "idea, the misconception that appears most often, and what is actually " +
      "examined.",
  ),
  sesi: bi("Sesi", "Session"),
  seringKeliru: bi("Yang paling sering keliru", "The most common misconception"),
  biasanyaDiuji: bi("Yang biasanya diuji", "What is usually examined"),
  rumusDiingat: bi("Rumus yang perlu diingat", "Formulas worth remembering"),
  nama: bi("Nama", "Name"),
  rumus: bi("Rumus", "Formula"),
  latihanSesiIni: bi("Latihan sesi ini", "Practise this session"),
  kembali: bi("Kembali", "Back"),

  // Kaki
  dibuatOleh: bi("Dibuat oleh", "Built by"),
  mesinSwift: bi(
    "Mesin dan kunci jawabannya ditulis dalam Swift.",
    "The engine and its answer keys are written in Swift.",
  ),
  kodeSumber: bi("Kode sumber", "Source code"),

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
