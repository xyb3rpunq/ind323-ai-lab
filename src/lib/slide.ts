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
  judul: string;
  /** Baris kecil di atas judul. */
  kaki?: string;
  isi?: string;
  /** Daftar rumus, untuk salindia berjenis `rumus`. */
  rumus?: { nama: string; ekspresi: string }[];
  /** Nama gambar yang dipasang, untuk salindia berjenis `gambar`. */
  gambar?: "petaBank" | "kurvaJadwal";
  /**
   * Catatan pengajar. Tidak pernah tampil di layar proyektor; hanya terlihat
   * kalau panel catatan dinyalakan.
   */
  catatan?: string;
}

function untukSesi(m: Materi): Salindia[] {
  const jumlahSoal = BANK.filter((s) => s.sesi === m.sesi).length;
  const kaki = `Sesi ${String(m.sesi).padStart(2, "0")} · ${m.judul}`;

  const keluar: Salindia[] = [
    {
      jenis: "bagian",
      sesi: m.sesi,
      judul: m.judul,
      kaki: `Sesi ${String(m.sesi).padStart(2, "0")} dari ${MATERI.length}`,
      isi: `${jumlahSoal} soal di bank latihan`,
      catatan:
        "Buka dengan pertanyaan, bukan dengan definisi. Definisinya sudah ada " +
        "di modul; yang tidak ada di modul adalah alasan kenapa topik ini " +
        "muncul sama sekali.",
    },
    {
      jenis: "inti",
      sesi: m.sesi,
      judul: "Gagasan pokoknya",
      kaki,
      isi: m.inti,
      catatan:
        "Kalau hanya satu hal yang sempat tersampaikan dari sesi ini, ini " +
        "yang itu. Sisanya menyusul dari sini.",
    },
    {
      jenis: "keliru",
      sesi: m.sesi,
      judul: "Yang paling sering keliru",
      kaki,
      isi: m.keliru,
      catatan:
        "Tanyakan lebih dulu, jangan langsung dikoreksi. Kekeliruan yang " +
        "sempat diucapkan sendiri jauh lebih melekat daripada kekeliruan yang " +
        "hanya didengar sebagai peringatan.",
    },
  ];

  if (m.rumus.length > 0) {
    keluar.push({
      jenis: "rumus",
      sesi: m.sesi,
      judul: "Rumus yang dipakai",
      kaki,
      rumus: m.rumus,
      catatan:
        "Turunkan satu di papan, sisanya rujuk saja. Rumus yang hanya " +
        "ditampilkan akan dihafal; rumus yang diturunkan akan dipahami.",
    });
  }

  keluar.push({
    jenis: "diuji",
    sesi: m.sesi,
    judul: "Yang biasanya ditanyakan",
    kaki,
    isi: m.diuji,
    catatan:
      `Ada ${jumlahSoal} soal sesi ini di bank latihan. Sesi berbenih sama ` +
      "selalu identik, jadi kelas bisa mengerjakan sesi yang sama persis " +
      "dengan yang baru saja Anda tayangkan.",
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
      judul: "Kecerdasan Buatan",
      kaki: "IND323",
      isi: `${MATERI.length} sesi · ${BANK.length} soal latihan · ${SESI.length} topik`,
      catatan:
        "Sebutkan di awal bahwa seluruh kunci jawaban soal berhitung dihitung " +
        "mesin, bukan diketik tangan, dan mesinnya sudah diadu dengan lima " +
        "implementasi lain sampai cocok bit demi bit. Itu menjelaskan kenapa " +
        "bahan ini bisa dipercaya sebagai rujukan, bukan sekadar sebagai " +
        "catatan.",
    },
    {
      jenis: "gambar",
      sesi: 0,
      judul: "Apa yang sebenarnya diuji",
      kaki: "Peta cakupan",
      gambar: "petaBank",
      catatan:
        "Tunjukkan lubangnya. Sesi yang tidak punya satu pun soal penerapan " +
        "adalah sesi yang belum pernah benar-benar diuji pemahamannya, dan " +
        "kelas berhak tahu itu di awal.",
    },
  ];

  const penutup: Salindia[] = [
    {
      jenis: "gambar",
      sesi: 0,
      judul: "Kapan mengulangnya",
      kaki: "Penjadwalan SM-2",
      gambar: "kurvaJadwal",
      catatan:
        "Perlihatkan harga satu kesalahan dengan menggeser kendalinya di " +
        "depan kelas. Angka yang berubah saat digeser jauh lebih meyakinkan " +
        "daripada angka yang sudah tercetak.",
    },
    {
      jenis: "penutup",
      sesi: 0,
      judul: "Latihan",
      kaki: "IND323",
      isi:
        "Sesi berbenih sama selalu berisi soal yang sama dalam urutan yang " +
        "sama. Sebutkan satu benih, dan seluruh kelas mengerjakan sesi yang " +
        "identik.",
      catatan:
        "Sebutkan satu angka benih di sini dan minta semua orang memakainya. " +
        "Pembahasannya jadi bisa dilakukan bersama, soal demi soal.",
    },
  ];

  return [...sampul, ...MATERI.flatMap(untukSesi), ...penutup];
}

/** Salindia pertama untuk tiap sesi, dipakai daftar isi. */
export function penandaSesi(salindia: Salindia[]): { sesi: number; indeks: number; judul: string }[] {
  const keluar: { sesi: number; indeks: number; judul: string }[] = [];
  salindia.forEach((s, i) => {
    if (s.jenis === "bagian") keluar.push({ sesi: s.sesi, indeks: i, judul: s.judul });
  });
  return keluar;
}
