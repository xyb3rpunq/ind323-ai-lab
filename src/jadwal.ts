/**
 * Penjadwal ulangan SM-2, sisi peramban.
 *
 * # Kenapa ini ada dua kali
 *
 * Sumber kebenarannya `Sources/AIKit/Ujian.swift`. Salinan di sini ada karena
 * halaman menggambar kurva penjadwalannya secara langsung, dan menggambar
 * kurva menuntut menjalankan algoritmanya di peramban — sementara Swift di
 * proyek ini hanya berjalan saat build.
 *
 * Dua salinan sebuah algoritma akan menyimpang. Yang menahannya di sini adalah
 * `uji-web/jadwal.test.ts`, yang membandingkan keluaran berkas ini dengan
 * jejak yang dihasilkan Swift, **pola bit demi pola bit**. Kurva yang digambar
 * dari salinan yang menyimpang mengajarkan algoritma yang bukan algoritma
 * situs ini — dan justru kurva itu yang akan dipercaya pembaca, karena kode
 * Swift-nya tidak pernah ia lihat.
 *
 * .Deckyx
 */

/** Keadaan hafalan sebuah soal. */
export interface Hafalan {
  kode: string;
  /** Berapa kali berturut-turut dijawab benar. */
  ulangan: number;
  /** Jarak hari sampai ulangan berikutnya. */
  jarakHari: number;
  /** Faktor kemudahan; makin kecil makin sering diulang. */
  kemudahan: number;
}

/**
 * Batas bawah faktor kemudahan.
 *
 * SM-2 asli memakai 1,3. Tanpa batas bawah, soal yang berkali-kali salah akan
 * mendapat faktor mendekati nol dan muncul terus-menerus sampai menutupi
 * seluruh sesi — menghukum mahasiswa karena satu topik yang belum dikuasai,
 * bukan membantunya.
 */
export const KEMUDAHAN_MINIMUM = 2.5 - 1.2;

export function hafalanBaru(kode: string): Hafalan {
  return { kode, ulangan: 0, jarakHari: 0, kemudahan: 2.5 };
}

/**
 * Memperbarui jadwal setelah sebuah soal dijawab.
 *
 * `mutu` bernilai 0 sampai 5 seperti SM-2 asli: 0 sampai 2 berarti salah,
 * 3 ke atas berarti benar dengan tingkat kelancaran yang berbeda.
 */
export function perbarui(h: Hafalan, mutu: number): Hafalan {
  const q = Math.min(Math.max(Math.trunc(mutu), 0), 5);
  const baru: Hafalan = { ...h };

  if (q < 3) {
    // Salah mengembalikan hitungannya ke nol, tetapi tidak menghapus faktor
    // kemudahannya. Yang perlu diulang adalah soalnya, bukan seluruh riwayat
    // belajarnya.
    baru.ulangan = 0;
    baru.jarakHari = 1;
  } else {
    baru.ulangan = h.ulangan + 1;
    if (baru.ulangan === 1) baru.jarakHari = 1;
    else if (baru.ulangan === 2) baru.jarakHari = 6;
    // `Math.round` JavaScript membulatkan −0,5 ke atas menjadi −0, sementara
    // `rounded()` Swift membulatkan menjauhi nol. Jarak hari selalu positif di
    // sini, jadi keduanya sepadan — dan uji terhadap jejak Swift yang
    // memastikannya, bukan alasan di komentar ini.
    else baru.jarakHari = Math.round(h.jarakHari * h.kemudahan);
  }

  const d = q;
  baru.kemudahan = Math.max(
    KEMUDAHAN_MINIMUM,
    h.kemudahan + (0.1 - (5.0 - d) * (0.08 + (5.0 - d) * 0.02)),
  );
  return baru;
}

/**
 * Mengubah hasil penilaian menjadi nilai mutu SM-2.
 *
 * Jawaban benar yang cepat dinilai lebih tinggi daripada yang lambat, karena
 * kelancaran adalah bagian dari penguasaan — jawaban benar setelah menimbang
 * satu menit menandakan materinya belum benar-benar melekat.
 */
export function mutu(benar: boolean, detik: number, batasDetik: number): number {
  if (!benar) return detik >= batasDetik ? 0 : 2;
  const bagian = batasDetik > 0 ? detik / batasDetik : 1.0;
  if (bagian <= 0.34) return 5;
  if (bagian <= 0.67) return 4;
  return 3;
}

/** Satu titik pada jejak penjadwalan. */
export interface TitikJadwal {
  ulanganKe: number;
  mutu: number;
  ulangan: number;
  jarakHari: number;
  kemudahan: number;
  /** Hari ke berapa ulangan ini jatuh, dihitung sejak hari nol. */
  hari: number;
}

/**
 * Menjalankan penjadwal atas sederet mutu, dan mencatat setiap langkahnya.
 *
 * `hari` dijumlahkan berjalan supaya kurvanya bisa digambar terhadap waktu
 * sungguhan, bukan terhadap nomor ulangan. Perbedaannya besar: pada deret
 * yang mulus, ulangan kesepuluh jatuh bertahun-tahun setelah yang pertama,
 * dan sumbu yang memakai nomor ulangan menyembunyikan justru pertumbuhan
 * itu.
 */
export function jejak(deretMutu: number[], kode = "contoh"): TitikJadwal[] {
  let h = hafalanBaru(kode);
  let hari = 0;
  const keluar: TitikJadwal[] = [];
  deretMutu.forEach((q, i) => {
    h = perbarui(h, q);
    hari += h.jarakHari;
    keluar.push({
      ulanganKe: i + 1,
      mutu: q,
      ulangan: h.ulangan,
      jarakHari: h.jarakHari,
      kemudahan: h.kemudahan,
      hari,
    });
  });
  return keluar;
}
