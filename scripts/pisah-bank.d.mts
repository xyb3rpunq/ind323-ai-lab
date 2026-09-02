/**
 * Tipe untuk `pisah-bank.mjs`.
 *
 * Skripnya sendiri ditulis JavaScript polos supaya bisa dijalankan Node tanpa
 * tahap kompilasi apa pun — ia berjalan sebelum penggabung modul, jadi ia
 * tidak boleh bergantung padanya. Tipenya ditulis terpisah di sini supaya
 * ujinya tetap diperiksa tipe seperti berkas lain.
 */

/** Sepasang teks untuk kedua bahasa. Sepadan dengan `Bilingual` di `src`. */
export interface Dwibahasa {
  id: string;
  en: string;
}

export interface SoalMentah {
  kode: string;
  sesi: number;
  topik: string;
  tingkat: number;
  pertanyaan: Dwibahasa;
  pembahasan: Dwibahasa;
  bentuk: "pilihan" | "angka" | "benarSalah";
  pilihan?: Dwibahasa[];
  benar?: number | boolean;
  jawaban?: number;
  toleransi?: number;
  satuan?: Dwibahasa;
}

export interface BankMentah {
  sesi: { nomor: number; nama: Dwibahasa }[];
  soal: SoalMentah[];
}

/**
 * Soal tanpa pembahasannya. Ditulis dengan `Omit` alih-alih diulang, supaya
 * bidang baru di banknya tidak diam-diam hilang dari intinya.
 */
export type SoalInti = Omit<SoalMentah, "pembahasan">;

export interface IntiBank {
  sesi: BankMentah["sesi"];
  soal: SoalInti[];
}

export type PetaPembahasan = Record<string, Dwibahasa>;

export declare const SUMBER: string;
export declare const INTI: string;
export declare const PEMBAHASAN: string;

export declare function pisah(bank: BankMentah): {
  inti: IntiBank;
  pembahasan: PetaPembahasan;
};
export declare function satukan(inti: IntiBank, pembahasan: PetaPembahasan): BankMentah;
export declare function keJson(nilai: unknown): string;
