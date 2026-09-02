/**
 * Menyusun materi kuliah menjadi deret salindia.
 *
 * # Kenapa salindianya dihasilkan, bukan ditulis
 *
 * Karena isinya sudah ada di `materi.ts`, dan menyalinnya ke berkas kedua
 * berarti dua tempat yang harus dijaga tetap sepadan. Yang tertinggal selalu
 * salinan yang jarang dibuka — dan pada bahan ajar, salinan yang tertinggal
 * itu justru yang diproyeksikan di depan kelas.
 *
 * # Kenapa satu gagasan per salindia
 *
 * Karena salindia yang diproyeksikan dibaca dari jarak lima meter oleh orang
 * yang juga sedang mendengarkan. Paragraf yang nyaman dibaca di layar sendiri
 * berubah menjadi dinding teks di dinding kelas, dan hadirin yang membacanya
 * berhenti mendengarkan. Batasnya bukan selera: sekitar empat puluh kata per
 * salindia, dan satu pesan yang bisa diucapkan dalam satu tarikan napas.
 *
 * .Deckyx
 */

import { BANK, SESI } from "../bank";
import { bi, type Bilingual } from "../i18n";
import { MATERI, type Materi } from "../materi";

/** Jenis salindia menentukan tata letaknya, bukan warnanya saja. */
export type JenisSalindia =
  | "sampul"
  | "bagian"
  | "inti"
  | "keliru"
  | "diuji"
  | "rumus"
  | "gambar"
  | "penutup";

export interface Salindia {
  jenis: JenisSalindia;
  /** Nomor sesi kuliah, atau 0 untuk salindia pembuka dan penutup. */
  sesi: number;
  judul: Bilingual;
  /** Baris kecil di atas judul. */
  kaki?: Bilingual;
  isi?: Bilingual;
  /** Daftar rumus, untuk salindia berjenis `rumus`. */
  rumus?: { nama: Bilingual; ekspresi: string }[];
  /** Nama gambar yang dipasang, untuk salindia berjenis `gambar`. */
  gambar?: "petaBank" | "kurvaJadwal";
  /**
   * Catatan pengajar. Tidak pernah tampil di layar proyektor; hanya terlihat
   * kalau panel catatan dinyalakan.
   */
  catatan?: Bilingual;
}

function untukSesi(m: Materi): Salindia[] {
  const jumlahSoal = BANK.filter((s) => s.sesi === m.sesi).length;
  const nomor = String(m.sesi).padStart(2, "0");
  const kaki = bi(`Sesi ${nomor} · ${m.judul.id}`, `Session ${nomor} · ${m.judul.en}`);

  const keluar: Salindia[] = [
    {
      jenis: "bagian",
      sesi: m.sesi,
      judul: m.judul,
      kaki: bi(
        `Sesi ${nomor} dari ${MATERI.length}`,
        `Session ${nomor} of ${MATERI.length}`,
      ),
      isi: bi(
        `${jumlahSoal} soal di bank latihan`,
        `${jumlahSoal} questions in the practice bank`,
      ),
      catatan: bi(
        "Buka dengan pertanyaan, bukan dengan definisi. Definisinya sudah ada " +
          "di modul; yang tidak ada di modul adalah alasan kenapa topik ini " +
          "muncul sama sekali.",
        "Open with a question, not a definition. The definitions are already " +
          "in the module; what is not in the module is why this topic exists " +
          "at all.",
      ),
    },
    {
      jenis: "inti",
      sesi: m.sesi,
      judul: bi("Gagasan pokoknya", "The core idea"),
      kaki,
      isi: m.inti,
      catatan: bi(
        "Kalau hanya satu hal yang sempat tersampaikan dari sesi ini, ini " +
          "yang itu. Sisanya menyusul dari sini.",
        "If only one thing from this session gets through, this is it. " +
          "Everything else follows from here.",
      ),
    },
    {
      jenis: "keliru",
      sesi: m.sesi,
      judul: bi("Yang paling sering keliru", "The most common misconception"),
      kaki,
      isi: m.keliru,
      catatan: bi(
        "Tanyakan lebih dulu, jangan langsung dikoreksi. Kekeliruan yang " +
          "sempat diucapkan sendiri jauh lebih melekat daripada kekeliruan " +
          "yang hanya didengar sebagai peringatan.",
        "Ask first; do not correct straight away. A misconception someone has " +
          "said out loud sticks far better than one they only heard as a " +
          "warning.",
      ),
    },
  ];

  if (m.rumus.length > 0) {
    keluar.push({
      jenis: "rumus",
      sesi: m.sesi,
      judul: bi("Rumus yang dipakai", "The formulas used"),
      kaki,
      rumus: m.rumus,
      catatan: bi(
        "Turunkan satu di papan, sisanya rujuk saja. Rumus yang hanya " +
          "ditampilkan akan dihafal; rumus yang diturunkan akan dipahami.",
        "Derive one on the board and merely reference the rest. A formula that " +
          "is only displayed gets memorised; a formula that is derived gets " +
          "understood.",
      ),
    });
  }

  keluar.push({
    jenis: "diuji",
    sesi: m.sesi,
    judul: bi("Yang biasanya ditanyakan", "What is usually asked"),
    kaki,
    isi: m.diuji,
    catatan: bi(
      `Ada ${jumlahSoal} soal sesi ini di bank latihan. Sesi berbenih sama ` +
        "selalu identik, jadi kelas bisa mengerjakan sesi yang sama persis " +
        "dengan yang baru saja Anda tayangkan.",
      `There are ${jumlahSoal} questions from this session in the practice ` +
        "bank. Sessions with the same seed are always identical, so the class " +
        "can work through exactly the session you just showed.",
    ),
  });

  return keluar;
}

/**
 * Seluruh salindia, berurutan.
 *
 * Kedua salindia gambar disisipkan di tempat yang tepat menurut isinya, bukan
 * ditumpuk di belakang: peta cakupan bank soal masuk akal di pembukaan ketika
 * kelas belum tahu apa yang akan diuji, dan kurva penjadwalan masuk akal di
 * penutup ketika pertanyaan "lalu saya harus mengulang kapan" baru muncul.
 */
export function susunSalindia(): Salindia[] {
  const sampul: Salindia[] = [
    {
      jenis: "sampul",
      sesi: 0,
      judul: bi("Kecerdasan Buatan", "Artificial Intelligence"),
      kaki: bi("IND323", "IND323"),
      isi: bi(
        `${MATERI.length} sesi · ${BANK.length} soal latihan · ${SESI.length} topik`,
        `${MATERI.length} sessions · ${BANK.length} practice questions · ${SESI.length} topics`,
      ),
      catatan: bi(
        "Sebutkan di awal bahwa seluruh kunci jawaban soal berhitung dihitung " +
          "mesin, bukan diketik tangan, dan mesinnya sudah diadu dengan lima " +
          "implementasi lain sampai cocok bit demi bit. Itu menjelaskan kenapa " +
          "bahan ini bisa dipercaya sebagai rujukan, bukan sekadar sebagai " +
          "catatan.",
        "Say at the outset that every answer key for a calculation is computed " +
          "by machine, not typed by hand, and that the engine has been checked " +
          "against five other implementations down to the bit. That is why this " +
          "material can be trusted as a reference rather than as notes.",
      ),
    },
    {
      jenis: "gambar",
      sesi: 0,
      judul: bi("Apa yang sebenarnya diuji", "What is actually tested"),
      kaki: bi("Peta cakupan", "Coverage map"),
      gambar: "petaBank",
      catatan: bi(
        "Tunjukkan lubangnya. Sesi yang tidak punya satu pun soal penerapan " +
          "adalah sesi yang belum pernah benar-benar diuji pemahamannya, dan " +
          "kelas berhak tahu itu di awal.",
        "Point at the gaps. A session with no application-level question is a " +
          "session whose understanding has never really been tested, and the " +
          "class deserves to know that up front.",
      ),
    },
  ];

  const penutup: Salindia[] = [
    {
      jenis: "gambar",
      sesi: 0,
      judul: bi("Kapan mengulangnya", "When to review"),
      kaki: bi("Penjadwalan SM-2", "SM-2 scheduling"),
      gambar: "kurvaJadwal",
      catatan: bi(
        "Perlihatkan harga satu kesalahan dengan menggeser kendalinya di " +
          "depan kelas. Angka yang berubah saat digeser jauh lebih meyakinkan " +
          "daripada angka yang sudah tercetak.",
        "Show the cost of a single mistake by dragging the controls in front " +
          "of the class. A number that changes as you drag is far more " +
          "convincing than one already printed.",
      ),
    },
    {
      jenis: "penutup",
      sesi: 0,
      judul: bi("Latihan", "Practice"),
      kaki: bi("IND323", "IND323"),
      isi: bi(
        "Sesi berbenih sama selalu berisi soal yang sama dalam urutan yang " +
          "sama. Sebutkan satu benih, dan seluruh kelas mengerjakan sesi yang " +
          "identik.",
        "Sessions with the same seed always contain the same questions in the " +
          "same order. Name one seed, and the whole class works an identical " +
          "session.",
      ),
      catatan: bi(
        "Sebutkan satu angka benih di sini dan minta semua orang memakainya. " +
          "Pembahasannya jadi bisa dilakukan bersama, soal demi soal.",
        "Name a seed number here and ask everyone to use it. The debrief can " +
          "then happen together, question by question.",
      ),
    },
  ];

  return [...sampul, ...MATERI.flatMap(untukSesi), ...penutup];
}

/** Salindia pertama untuk tiap sesi, dipakai daftar isi. */
export function penandaSesi(
  salindia: Salindia[],
): { sesi: number; indeks: number; judul: Bilingual }[] {
  const keluar: { sesi: number; indeks: number; judul: Bilingual }[] = [];
  salindia.forEach((s, i) => {
    if (s.jenis === "bagian") keluar.push({ sesi: s.sesi, indeks: i, judul: s.judul });
  });
  return keluar;
}
