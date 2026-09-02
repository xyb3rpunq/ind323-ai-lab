/**
 * Bahasa yang sedang dipilih — satu-satunya bagian i18n yang reaktif.
 *
 * Tipe `Bilingual`, konstruktor `bi()`, dan kamus `T` ada di `i18n.ts` yang
 * biasa. Alasannya ada di kepala berkas itu: berkas rune hanya bisa diurai
 * perkakas Svelte, dan menaruh tipe di dalamnya membuat setiap modul yang
 * menyentuhnya ikut tidak bisa diuji.
 *
 * Keduanya diekspor ulang dari sini supaya komponen cukup mengimpor satu
 * tempat.
 *
 * .Deckyx
 */

import { T, type Bilingual, type Lang } from "./i18n";

export { T, bi, type Bilingual, type Lang } from "./i18n";

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
  terapkanKepala(sekarang);
  return sekarang;
}

/**
 * Menerapkan bahasa pada kepala dokumen.
 *
 * `lang` bukan hiasan: ia menentukan suara pembaca layar, pemenggalan kata,
 * dan tanda kutip yang dipilih peramban. Judul tab ikut karena ia satu-satunya
 * teks yang tidak terlihat di halaman — sehingga ia juga satu-satunya yang
 * bisa tertinggal berbulan-bulan tanpa ada yang menyadarinya.
 */
function terapkanKepala(b: Lang): void {
  document.documentElement.lang = b;
  document.title = T.judulTab[b];
}

/** Bahasa yang sedang aktif. */
export function bahasa(): Lang {
  return sekarang;
}

/** Mengganti bahasa aktif. */
export function aturBahasa(berikut: Lang): void {
  if (berikut === sekarang) return;
  sekarang = berikut;
  terapkanKepala(berikut);
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
