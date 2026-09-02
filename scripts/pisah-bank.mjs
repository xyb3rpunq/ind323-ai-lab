/**
 * Memisahkan pembahasan dari bank soal, supaya ia tidak ikut terunduh di muka.
 *
 * # Kenapa dipisah
 *
 * Pembahasan tiap soal panjang — memang harus panjang, karena soal tanpa
 * penjelasan hanya menguji dan tidak mengajari — dan sekarang ada dalam dua
 * bahasa. Dalam bentuk terkompresi ia 8 KB dari 14 KB seluruh bank: lebih dari
 * separuhnya, dan seluruhnya teks yang tidak dibaca siapa pun sebelum satu
 * soal pun dijawab.
 *
 * Selama ia satu berkas dengan banknya, penggabung modul tidak punya cara
 * memisahkannya: `import` sebuah JSON memuat seluruh isinya. Jadi pemisahannya
 * dilakukan di sini, sebelum penggabungnya melihat apa pun.
 *
 * # Kenapa diturunkan, bukan dihasilkan Swift langsung
 *
 * Karena `bank.json` adalah satu-satunya keluaran Swift dan harus tetap
 * begitu: ia yang dibandingkan CI untuk memastikan bank tersimpan masih
 * sepadan dengan sumbernya. Menjadikan Swift menulis dua berkas berarti
 * perbandingan itu ikut bercabang, demi pemisahan yang sama sekali bukan
 * urusan Swift — ia urusan penggabung modul di sisi peramban.
 *
 * Pemisahan yang diturunkan bisa diperiksa dengan cara yang jauh lebih kuat
 * daripada apa pun yang bisa dilakukan Swift: menyatukannya kembali harus
 * menghasilkan bank yang sama persis. {@link satukan} ada justru untuk itu.
 *
 * .Deckyx
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AKAR = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SUMBER = join(AKAR, "src", "generated", "bank.json");
export const INTI = join(AKAR, "src", "generated", "bank-inti.json");
export const PEMBAHASAN = join(AKAR, "src", "generated", "bank-pembahasan.json");

/**
 * Memisahkan bank menjadi inti dan pembahasan.
 *
 * Urutan soal dipertahankan apa adanya; pembahasannya diberi kunci kode soal,
 * bukan indeks. Kunci berupa indeks akan diam-diam menggeser seluruh pembahasan
 * begitu satu soal disisipkan di tengah — dan yang tergeser tetap tampil masuk
 * akal, hanya menjelaskan soal yang salah.
 */
export function pisah(bank) {
  const inti = {
    sesi: bank.sesi,
    soal: bank.soal.map(({ pembahasan: _, ...sisa }) => sisa),
  };
  const pembahasan = {};
  for (const s of bank.soal) pembahasan[s.kode] = s.pembahasan;
  return { inti, pembahasan };
}

/**
 * Menyatukan kembali inti dan pembahasan menjadi bank yang utuh.
 *
 * Ada untuk diuji, bukan untuk dipakai program. Selama menyatukan hasil
 * {@link pisah} menghasilkan bank yang sama persis dengan yang masuk,
 * pemisahannya tidak mungkin menghilangkan atau menukar apa pun.
 */
export function satukan(inti, pembahasan) {
  return {
    sesi: inti.sesi,
    soal: inti.soal.map((s) => ({ ...s, pembahasan: pembahasan[s.kode] })),
  };
}

/** Bentuk tulisan yang dipakai kedua berkas turunan. */
export function keJson(nilai) {
  return JSON.stringify(nilai, null, 2) + "\n";
}

function utama() {
  const bank = JSON.parse(readFileSync(SUMBER, "utf8"));
  const { inti, pembahasan } = pisah(bank);
  writeFileSync(INTI, keJson(inti), "utf8");
  writeFileSync(PEMBAHASAN, keJson(pembahasan), "utf8");
  console.log(
    `${inti.soal.length} soal dipisah dari ${Object.keys(pembahasan).length} pembahasan.`,
  );
}

// Dijalankan sebagai program hanya bila memang dipanggil langsung; diimpor
// uji tanpa menulis berkas apa pun.
if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  utama();
}
