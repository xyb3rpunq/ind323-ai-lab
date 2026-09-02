/**
 * Bank soal dan mesin sesi ujian di sisi peramban.
 *
 * # Yang di sini bukan sumber kebenaran
 *
 * Soal beserta kunci jawabannya datang dari `src/generated/bank.json`, yang
 * dihasilkan paket Swift saat build — di sini dibaca lewat `bank-inti.json`,
 * turunannya tanpa pembahasan. Pembahasannya diunduh terpisah; lihat
 * `pembahasan.svelte.ts`. Kunci soal berhitung **dihitung** modul
 * Swift yang sama yang diadu terhadap 3.796 pernyataan berpola bit — bukan
 * diketik tangan.
 *
 * Berkas ini hanya membaca hasilnya dan menjalankan sesinya. Ia sengaja tidak
 * menghitung ulang apa pun: perhitungan kedua di sisi peramban akan menjadi
 * salinan yang menyimpang dari aslinya cepat atau lambat, dan menyimpangnya
 * tidak akan terlihat karena keduanya sama-sama masuk akal.
 *
 * Pengacakan sesi ditulis ulang di sini, dan itu satu-satunya pengecualian —
 * dengan syarat ia menghasilkan urutan yang sama persis dengan Swift. Uji di
 * `tests/` membandingkan keduanya pada benih yang sama.
 *
 * .Deckyx
 */

import mentah from "./generated/bank-inti.json";
import { bi, type Bilingual } from "./i18n";

/**
 * Bentuk soal sebagaimana tertulis di JSON.
 *
 * `kode` dan `topik` sengaja tetap satu untai: keduanya kunci, bukan teks yang
 * dibaca. `topik` dipakai mengelompokkan ketepatan, dan kunci yang ikut
 * berganti bahasa menghasilkan dua ringkasan yang tidak bisa dibandingkan.
 * Nama topik yang dibaca manusia ada di {@link NAMA_TOPIK}.
 */
export type Soal =
  | {
      kode: string;
      sesi: number;
      topik: string;
      tingkat: number;
      pertanyaan: Bilingual;
      bentuk: "pilihan";
      pilihan: Bilingual[];
      benar: number;
    }
  | {
      kode: string;
      sesi: number;
      topik: string;
      tingkat: number;
      pertanyaan: Bilingual;
      bentuk: "angka";
      jawaban: number;
      toleransi: number;
      satuan: Bilingual;
    }
  | {
      kode: string;
      sesi: number;
      topik: string;
      tingkat: number;
      pertanyaan: Bilingual;
      bentuk: "benarSalah";
      benar: boolean;
    };

export interface Sesi {
  nomor: number;
  nama: Bilingual;
}

/**
 * Nama topik yang dibaca manusia.
 *
 * Terpisah dari banknya karena `topik` di sana adalah **kunci**: ia dipakai
 * mengelompokkan ketepatan, dan pengelompokan yang berbeda di tiap bahasa
 * menghasilkan dua ringkasan yang tidak bisa dibandingkan satu sama lain.
 *
 * Ada di sisi antarmuka, bukan di Swift, karena nama yang dibaca manusia
 * memang urusan tampilan — sama seperti nama pita tafsir dan nama himpunan
 * kabur di ketiga situs saudara.
 */
export const NAMA_TOPIK: Record<string, Bilingual> = {
  "Basis pengetahuan": bi("Basis pengetahuan", "Knowledge base"),
  "Big data": bi("Big data", "Big data"),
  "Certainty Factor": bi("Certainty Factor", "Certainty factor"),
  Defuzzifikasi: bi("Defuzzifikasi", "Defuzzification"),
  "Derajat keanggotaan": bi("Derajat keanggotaan", "Degree of membership"),
  ELIZA: bi("ELIZA", "ELIZA"),
  "Efek ELIZA": bi("Efek ELIZA", "The ELIZA effect"),
  Entropi: bi("Entropi", "Entropy"),
  Evaluasi: bi("Evaluasi", "Evaluation"),
  "Fungsi aktivasi": bi("Fungsi aktivasi", "Activation function"),
  Heuristik: bi("Heuristik", "Heuristics"),
  "Inferensi kabur": bi("Inferensi kabur", "Fuzzy inference"),
  "Jaringan semantik": bi("Jaringan semantik", "Semantic networks"),
  "Jenis agen": bi("Jenis agen", "Agent types"),
  "Keanggotaan kabur": bi("Keanggotaan kabur", "Fuzzy membership"),
  "Kendali PID": bi("Kendali PID", "PID control"),
  "Ketakmurnian Gini": bi("Ketakmurnian Gini", "Gini impurity"),
  Kinematika: bi("Kinematika", "Kinematics"),
  PEAS: bi("PEAS", "PEAS"),
  Pelatihan: bi("Pelatihan", "Training"),
  Pencarian: bi("Pencarian", "Search"),
  Perceptron: bi("Perceptron", "Perceptron"),
  "Pohon keputusan": bi("Pohon keputusan", "Decision trees"),
  "Rasio kemungkinan": bi("Rasio kemungkinan", "Likelihood ratio"),
  Resolusi: bi("Resolusi", "Resolution"),
  "Ruang keadaan": bi("Ruang keadaan", "State spaces"),
  "Sistem pakar": bi("Sistem pakar", "Expert systems"),
  Stemming: bi("Stemming", "Stemming"),
  "TF-IDF": bi("TF-IDF", "TF-IDF"),
  "Tabel kebenaran": bi("Tabel kebenaran", "Truth tables"),
  "Teorema Bayes": bi("Teorema Bayes", "Bayes' theorem"),
  "Uji Turing": bi("Uji Turing", "The Turing test"),
  "k-means": bi("k-means", "k-means"),
  kNN: bi("kNN", "kNN"),
};

/**
 * Nama sebuah topik, atau kuncinya sendiri bila belum punya terjemahan.
 *
 * Mengembalikan kuncinya alih-alih untai kosong: topik baru yang belum
 * diterjemahkan tetap terbaca, dan uji yang menuntut tiap kunci punya nama
 * yang akan memberitahunya — bukan halaman yang tiba-tiba kehilangan judul.
 */
export function namaTopik(kunci: string): Bilingual {
  return NAMA_TOPIK[kunci] ?? bi(kunci, kunci);
}

const data = mentah as { sesi: Sesi[]; soal: Soal[] };

export const SESI: Sesi[] = data.sesi;
export const BANK: Soal[] = data.soal;

/** Waktu yang diberikan per soal, dalam detik. Sepadan dengan sisi Swift. */
export const DETIK_PER_SOAL = 90;

// ---------------------------------------------------------------------------
// Pembangkit acak
// ---------------------------------------------------------------------------

/**
 * SplitMix64, ditulis dengan `BigInt` agar sepadan bit demi bit dengan Swift.
 *
 * JavaScript tidak punya bilangan bulat 64-bit, dan `Number` kehilangan
 * ketelitian di atas 2⁵³. `BigInt` lebih lambat tetapi tepat, dan sesi ujian
 * hanya membangkitkan puluhan angka — kecepatannya tidak pernah menjadi soal.
 *
 * Kalau ini ditulis dengan `Math.random`, sesi berbenih sama akan berbeda
 * antara yang disusun Swift dan yang disusun peramban, dan seluruh gagasan
 * "sesi yang bisa diulang" runtuh.
 */
export class SplitMix64 {
  private keadaan: bigint;
  private static readonly TOPENG = (1n << 64n) - 1n;

  constructor(benih: bigint | number = 0n) {
    this.keadaan = BigInt(benih) & SplitMix64.TOPENG;
  }

  u64(): bigint {
    const M = SplitMix64.TOPENG;
    this.keadaan = (this.keadaan + 0x9e3779b97f4a7c15n) & M;
    let z = this.keadaan;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & M;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & M;
    return (z ^ (z >> 31n)) & M;
  }

  /** Bilangan bulat di rentang `0..<n`, tanpa bias pembagian sisa. */
  dibawah(n: bigint): bigint {
    if (n <= 0n) return 0n;
    // Perkalian lebar lalu ambil paruh atasnya, sama seperti sisi Swift.
    // Memakai sisa pembagian akan memberi peluang lebih besar pada nilai awal,
    // dan biasnya tidak akan pernah terlihat pada mata telanjang.
    return (this.u64() * n) >> 64n;
  }

  /** Mengacak isi sebuah larik di tempat. */
  acak<T>(isi: T[]): void {
    if (isi.length < 2) return;
    for (let i = isi.length - 1; i > 0; i -= 1) {
      const j = Number(this.dibawah(BigInt(i + 1)));
      const t = isi[i]!;
      isi[i] = isi[j]!;
      isi[j] = t;
    }
  }
}

// ---------------------------------------------------------------------------
// Penyusun sesi
// ---------------------------------------------------------------------------

export interface SesiUjian {
  benih: bigint;
  soal: Soal[];
  batasDetik: number;
}

/**
 * Menyusun sesi dari bank soal.
 *
 * Bank diurutkan menurut kode lebih dulu. Urutan di berkas JSON bisa berubah
 * kapan saja, dan tanpa pengurutan ini benih yang sama akan menghasilkan sesi
 * yang berbeda setelah seseorang menyisipkan satu soal.
 */
export function susunSesi(
  banyak: number,
  benih: bigint,
  sesiTerpilih?: number,
): SesiUjian {
  let tersedia = [...BANK];
  if (sesiTerpilih !== undefined) {
    tersedia = tersedia.filter((s) => s.sesi === sesiTerpilih);
  }
  tersedia.sort((a, b) => (a.kode < b.kode ? -1 : a.kode > b.kode ? 1 : 0));

  const acak = new SplitMix64(benih);
  acak.acak(tersedia);

  const dipakai = tersedia
    .slice(0, Math.max(0, banyak))
    .map((s) => acakPilihan(s, acak));

  return { benih, soal: dipakai, batasDetik: dipakai.length * DETIK_PER_SOAL };
}

/**
 * Mengacak urutan pilihan sebuah soal, sekaligus memindahkan kunci benarnya.
 *
 * Tanpa ini, jawaban benar akan selalu berada di posisi yang sama dan yang
 * dihafal mahasiswa adalah posisinya, bukan materinya.
 */
export function acakPilihan(soal: Soal, acak: SplitMix64): Soal {
  if (soal.bentuk !== "pilihan" || soal.pilihan.length < 2) return soal;
  const indeks = soal.pilihan.map((_, i) => i);
  acak.acak(indeks);
  const baru = indeks.map((i) => soal.pilihan[i]!);
  const benarBaru = indeks.indexOf(soal.benar);
  if (benarBaru < 0) return soal;
  return { ...soal, pilihan: baru, benar: benarBaru };
}

// ---------------------------------------------------------------------------
// Penilaian
// ---------------------------------------------------------------------------

export type Jawaban =
  | { jenis: "pilihan"; nilai: number }
  | { jenis: "angka"; nilai: number }
  | { jenis: "benarSalah"; nilai: boolean }
  | { jenis: "kosong" };

export interface Penilaian {
  kode: string;
  benar: boolean;
  selisih?: number;
}

/**
 * Menilai satu jawaban.
 *
 * Soal berangka dinilai dengan toleransi mutlak, bukan perbandingan persis.
 * Menuntut kesamaan persis pada jawaban yang dihitung tangan berarti menghukum
 * pembulatan yang wajar — mahasiswa yang menulis 0,79 untuk jawaban
 * 0,7900000000000001 tidak sedang keliru.
 */
export function nilai(soal: Soal, jawaban: Jawaban): Penilaian {
  if (jawaban.jenis === "kosong") {
    return { kode: soal.kode, benar: false };
  }
  if (soal.bentuk === "pilihan" && jawaban.jenis === "pilihan") {
    return { kode: soal.kode, benar: jawaban.nilai === soal.benar };
  }
  if (soal.bentuk === "benarSalah" && jawaban.jenis === "benarSalah") {
    return { kode: soal.kode, benar: jawaban.nilai === soal.benar };
  }
  if (soal.bentuk === "angka" && jawaban.jenis === "angka") {
    if (!Number.isFinite(jawaban.nilai)) {
      return { kode: soal.kode, benar: false };
    }
    const selisih = Math.abs(jawaban.nilai - soal.jawaban);
    return { kode: soal.kode, benar: selisih <= soal.toleransi, selisih };
  }
  // Bentuk jawaban yang tidak cocok dengan bentuk soalnya. Dinilai salah,
  // bukan menabrak: masukan yang tidak masuk akal tetap harus menghasilkan
  // hasil yang bisa ditampilkan.
  return { kode: soal.kode, benar: false };
}

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------

export interface RingkasanTopik {
  topik: string;
  benar: number;
  total: number;
}

export interface Ringkasan {
  benar: number;
  total: number;
  nilai: number;
  perTopik: RingkasanTopik[];
}

/**
 * Merangkum hasil sebuah sesi.
 *
 * Rincian per topik diurutkan menurut ketepatan **menaik**, sehingga topik
 * terlemah muncul lebih dulu. Mengurutkannya menurut nama akan membuat bagian
 * yang paling perlu diulang tenggelam di tengah daftar.
 */
export function rangkum(soal: Soal[], penilaian: Penilaian[]): Ringkasan {
  const benar = penilaian.filter((p) => p.benar).length;
  const total = penilaian.length;
  const indeks = new Map(soal.map((s) => [s.kode, s]));

  const peta = new Map<string, { benar: number; total: number }>();
  for (const p of penilaian) {
    const s = indeks.get(p.kode);
    if (!s) continue;
    const catatan = peta.get(s.topik) ?? { benar: 0, total: 0 };
    catatan.total += 1;
    if (p.benar) catatan.benar += 1;
    peta.set(s.topik, catatan);
  }

  const perTopik = [...peta.entries()]
    .map(([topik, v]) => ({ topik, benar: v.benar, total: v.total }))
    .sort((a, b) => {
      const ta = a.benar / a.total;
      const tb = b.benar / b.total;
      // Seri dipecah menurut nama supaya laporannya sama tiap kali dihasilkan.
      return ta === tb ? (a.topik < b.topik ? -1 : 1) : ta - tb;
    });

  return {
    benar,
    total,
    nilai: total === 0 ? 0 : (benar / total) * 100,
    perTopik,
  };
}

/** Membaca angka dari teks, menerima koma sebagai pemisah desimal. */
export function bacaAngka(teks: string): number {
  const bersih = teks.trim().replace(",", ".");
  if (bersih.length === 0) return NaN;
  const v = Number(bersih);
  return Number.isFinite(v) ? v : NaN;
}

/** Memformat detik menjadi mm:ss. */
export function jam(detik: number): string {
  const d = Math.max(0, Math.floor(detik));
  const m = Math.floor(d / 60);
  const s = d % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
