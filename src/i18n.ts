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

  ringkasHasil: bi(
    "%B benar dari %T soal, dikerjakan dalam %W.",
    "%B of %T questions correct, completed in %W.",
  ),
  ringkasBenih: bi(
    "Benih %S — pakai benih yang sama untuk mengulang sesi ini persis.",
    "Seed %S — use the same seed to repeat this session exactly.",
  ),

  // Ekspor
  simpanHasil: bi("Simpan hasil", "Save your result"),
  catatanEkspor: bi(
    "Unduh rapor lengkapnya — nilai, ketepatan tiap topik, dan setiap soal " +
      "beserta pembahasannya — sebagai satu berkas yang bisa dibuka Excel, " +
      "atau cetak halamannya menjadi PDF.",
    "Download the full report — score, per-topic accuracy, and every question " +
      "with its explanation — as one file Excel can open, or print the page to " +
      "PDF.",
  ),
  unduhCsv: bi("Unduh CSV (Excel)", "Download CSV (Excel)"),
  cetakPdf: bi("Cetak / simpan PDF", "Print / save as PDF"),
  diunduh: bi("Diunduh", "Downloaded"),
  unduhanDitolak: bi("Peramban menolak unduhan", "The browser refused the download"),

  // Kaki
  dibuatOleh: bi("Dibuat oleh", "Built by"),
  mesinSwift: bi(
    "Mesin dan kunci jawabannya ditulis dalam Swift.",
    "The engine and its answer keys are written in Swift.",
  ),
  berandaIntro: bi(
    "%N soal dari 14 sesi kuliah. Kunci jawaban soal berhitung dihitung mesin, bukan diketik tangan — mesinnya ditulis dalam Swift dan sudah diadu dengan lima implementasi lain sampai cocok bit demi bit.",
    "%N questions across 14 course sessions. The answer key for every calculated question is computed by the engine, not typed by hand — that engine is written in Swift and has been checked against five other implementations down to the bit.",
  ),
  berandaBenih: bi(
    "Sesi berbenih sama selalu berisi soal yang sama dalam urutan yang sama, jadi Anda bisa mengulanginya setelah mempelajari kesalahannya.",
    "A session with the same seed always contains the same questions in the same order, so you can repeat it after studying your mistakes.",
  ),
  catatanPewaktu: bi(
    "Waktunya 90 detik per soal, dihitung untuk seluruh sesi sekaligus. Pewaktu per soal memaksa ritme yang seragam, padahal soal berhitung memang butuh lebih lama daripada soal ingatan.",
    "Ninety seconds per question, counted across the whole session at once. A per-question timer forces a uniform rhythm, yet a calculation genuinely takes longer than a recall question.",
  ),
  catatanSm2: bi(
    "Situs ini memakai penjadwal SM-2 — algoritma pengulangan berjarak yang sama dengan yang dipakai SuperMemo dan Anki. Ia menunda soal yang sudah dikuasai supaya waktunya bisa dipakai untuk soal yang belum, dan menjatuhkan jaraknya kembali ke satu hari begitu sebuah soal terjawab salah. Geser kendali di bawah untuk melihat harga satu kesalahan.",
    "This site uses the SM-2 scheduler — the same spaced-repetition algorithm behind SuperMemo and Anki. It postpones questions you have mastered so the time goes to the ones you have not, and drops the interval back to a single day the moment a question is answered wrongly. Move the control below to see what one mistake costs.",
  ),
  catatanDuaKali: bi(
    "Algoritmanya ditulis dua kali: sekali di Swift sebagai sumber kebenaran, sekali di TypeScript supaya kurva ini bisa digambar di peramban. Keduanya diadu di CI — pola bit demi pola bit, termasuk faktor kemudahannya. Kurva yang digambar dari salinan yang menyimpang akan mengajarkan algoritma yang bukan algoritma situs ini.",
    "The algorithm is written twice: once in Swift as the source of truth, once in TypeScript so this curve can be drawn in the browser. The two are checked against each other in CI — bit pattern by bit pattern, easiness factor included. A curve drawn from a copy that had drifted would teach an algorithm that is not this site's algorithm.",
  ),
  merekSub: bi("Pendamping kuliah & bank soal", "Course companion & question bank"),
  pilihanJawaban: bi("Pilihan jawaban", "Answer options"),
  jawabanAngka: bi(
    "Jawaban berupa angka%S — koma maupun titik sama-sama diterima",
    "A numeric answer%S — a comma or a full stop are both accepted",
  ),
  tidakAda: bi("tidak ada", "none"),
  soalKeDari: bi("Soal %I dari %T", "Question %I of %T"),
  jawabanDiterima: bi(
    "Jawaban yang diterima: %J (toleransi ±%E)",
    "Accepted answer: %J (tolerance ±%E)",
  ),

  // -- pintasan papan tik mode presentasi ----------------------------------
  pintasBerikut: bi("salindia berikutnya", "next slide"),
  pintasSebelum: bi("salindia sebelumnya", "previous slide"),
  pintasUjung: bi("awal · akhir", "first · last"),
  pintasLayarPenuh: bi("layar penuh", "full screen"),
  pintasCatatan: bi("catatan pengajar", "presenter notes"),
  pintasDaftar: bi("daftar sesi", "session list"),
  pintasTutup: bi("tutup lapisan, atau keluar", "close the overlay, or exit"),
  catatanAlamat: bi(
    "Nomor salindia tersimpan di alamat. Kalau proyektornya mati, muat ulang halamannya dan presentasi lanjut dari tempatnya berhenti.",
    "The slide number is kept in the address. If the projector dies, reload the page and the presentation resumes where it stopped.",
  ),

  petakSoal: bi("%N soal", "%N questions"),

  // -- keterangan gambar ---------------------------------------------------
  petaJudul: bi("Cakupan bank soal", "Question-bank coverage"),
  petaTerang: bi(
    "Tiap petak satu sesi pada satu tingkat kesulitan; makin pekat makin banyak soalnya, dan petak kosong berarti tidak ada satu pun. Dari %K kombinasi, %O masih kosong. Angka di daftar sesi hanya menjawab berapa banyak soal yang ada; peta ini menjawab soal yang mana — dan sesi yang tak punya satu pun soal penerapan terlihat langsung sebagai baris yang habis di kolom kanan.",
    "Each square is one session at one difficulty level; the darker it is the more questions it holds, and an empty square means none at all. Of %K combinations, %O are still empty. The numbers in the session list answer how many questions exist; this map answers which ones — and a session with no application questions shows up immediately as a row that runs out towards the right.",
  ),
  kurvaJudul: bi(
    "Jarak sampai soal itu muncul lagi",
    "How long until the question comes back",
  ),
  kurvaTerang: bi(
    "Sumbu tegaknya logaritmik: tiap garis sepuluh kali garis di bawahnya. Setelah %U ulangan yang mulus, soalnya kembali %M sekali.",
    "The vertical axis is logarithmic: each gridline is ten times the one below it. After %U clean repetitions, the question returns once every %M.",
  ),
  kurvaTerangSalah: bi(
    "Sumbu tegaknya logaritmik: tiap garis sepuluh kali garis di bawahnya. Setelah %U ulangan yang mulus, soalnya kembali %M sekali. Satu jawaban salah di ulangan ke-%S menjatuhkannya kembali ke satu hari — dan pada akhir deret yang sama, jaraknya tinggal %T. Itulah harga satu kesalahan, dan itulah sebabnya penjadwal ini menunda soal yang sudah dikuasai alih-alih mengulanginya terus.",
    "The vertical axis is logarithmic: each gridline is ten times the one below it. After %U clean repetitions, the question returns once every %M. A single wrong answer at repetition %S drops it back to one day — and by the end of the same series, the interval is down to %T. That is the price of one mistake, and it is why this scheduler postpones what you have mastered instead of repeating it.",
  ),
  kurvaSelaluBenar: bi("selalu benar", "always correct"),
  kurvaSalahDi: bi("salah sekali di ulangan ke-%S", "one wrong answer at repetition %S"),
  batangJudul: bi("Ketepatan per topik", "Accuracy per topic"),
  batangTerang: bi(
    "Diurutkan menurut ketepatan menaik, bukan menurut nama — bagian yang paling perlu diulang harus muncul lebih dulu, bukan tenggelam di tengah daftar. Garis putus-putus di %A% adalah batas yang dianggap sudah dikuasai; %B dari %C topik masih di kirinya. Angka di ujung tiap bilah adalah jumlah soalnya: dua dari dua dan delapan dari sepuluh sama-sama tergambar penuh, tetapi hanya yang kedua yang benar-benar memberi tahu sesuatu.",
    "Sorted by accuracy ascending, not by name — what most needs revisiting has to appear first, not sink into the middle of a list. The dashed line at %A% is the threshold counted as mastered; %B of %C topics are still to its left. The number at the end of each bar is how many questions it covers: two out of two and eight out of ten both draw as a full bar, but only the second tells you anything.",
  ),
  keluargaJudul: bi("Tiga situs saudara", "Three sibling sites"),
  keluargaIsi: bi(
    "Silabus IND323 yang sama dikerjakan empat kali, dalam empat bahasa yang berbeda. Bukan salinan satu sama lain: tiap situs punya bentuk dan audiensnya sendiri, dan algoritmanya ditulis ulang dari rumusnya — bukan diterjemahkan dari kode mana pun. Mesin Swift di situs ini salah satu dari keenam implementasi itu.",
    "The same IND323 syllabus, built four times in four different languages. Not copies of one another: each site has its own shape and audience, and its algorithms were written from the formula rather than translated from any existing code. The Swift engine behind this site is one of those six implementations.",
  ),
  keluargaTaut: bi(
    "Jawaban keenam implementasi disandingkan sampai ke bitnya di",
    "All six implementations' answers are placed side by side, down to the bit, in",
  ),
  keluargaHalaman: bi("Enam bahasa, satu angka", "Six languages, one number"),
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
