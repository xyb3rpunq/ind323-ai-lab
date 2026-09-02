/**
 * Pembahasan soal, diunduh terpisah dari banknya.
 *
 * # Kenapa terpisah
 *
 * Karena tidak ada satu pun pembahasan yang dibaca sebelum satu soal dijawab,
 * sementara ukurannya lebih dari separuh seluruh bank. Menyertakannya di
 * berkas pertama berarti setiap orang yang membuka halaman depan mengunduh
 * penjelasan 49 soal dalam dua bahasa — termasuk yang hanya ingin membaca
 * daftar materinya.
 *
 * # Kenapa ditunggu, bukan ditampilkan belakangan
 *
 * Karena pembahasan yang datang terlambat lebih buruk daripada pembahasan yang
 * ditunggu sebentar: ia muncul setelah mata pembacanya berpindah, atau tidak
 * muncul sama sekali di sambungan yang putus, dan yang tampak adalah soal yang
 * dijawab tanpa penjelasan — persis keadaan yang dihindari seluruh rancangan
 * bank ini.
 *
 * Jadi ia dimuat saat sesi dimulai, sebelum layar ujian ditampilkan. Pada saat
 * itu penggunanya baru saja menekan tombol dan sedang menunggu; berkas 6 KB
 * dari asal yang sama tidak akan terasa.
 *
 * # Kenapa tanpa rune
 *
 * Karena tidak ada yang perlu diperbarui saat ia datang: layar ujian baru
 * ditampilkan sesudah pemuatannya selesai, dan Svelte menggambar ulang layar
 * itu karena layarnya yang berganti. Rune di sini hanya akan menambah
 * ketergantungan pada berkas `.svelte.ts` di modul yang justru paling ingin
 * bisa diuji tanpa Svelte sama sekali.
 *
 * .Deckyx
 */

import { bi, type Bilingual } from "./i18n";

type Peta = Readonly<Record<string, Bilingual>>;

let peta: Peta | null = null;
let sedangMuat: Promise<Peta> | null = null;

/**
 * Memuat pembahasan, sekali saja.
 *
 * Panggilan kedua yang datang sebelum yang pertama selesai ikut menunggu janji
 * yang sama, bukan membuat unduhan kedua. Tanpa itu, penekanan tombol ganda
 * akan mengunduhnya dua kali.
 */
export function muatPembahasan(): Promise<Peta> {
  if (peta !== null) return Promise.resolve(peta);
  sedangMuat ??= import("./generated/bank-pembahasan.json").then((m) => {
    peta = m.default as Peta;
    return peta;
  });
  return sedangMuat;
}

/**
 * Pembahasan satu soal, atau untai kosong bila belum termuat.
 *
 * Mengembalikan pasangan kosong alih-alih melemparkan galat: satu soal tanpa
 * pembahasan adalah kekurangan, sedangkan layar ujian yang runtuh di
 * tengah-tengah menghapus seluruh jawaban yang sudah dikerjakan.
 */
export function pembahasanDari(kode: string): Bilingual {
  return peta?.[kode] ?? bi("", "");
}

/** Apakah pembahasan sudah siap. Dipakai uji, dan tombol yang menunggunya. */
export function pembahasanSiap(): boolean {
  return peta !== null;
}
