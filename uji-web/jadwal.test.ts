/**
 * Mengadu penjadwal SM-2 sisi peramban dengan penjadwal Swift.
 *
 * Halaman menggambar kurva penjadwalan secara langsung, dan menggambar kurva
 * menuntut menjalankan algoritmanya di peramban — sementara Swift di proyek
 * ini hanya berjalan saat build. Karena itu algoritmanya ada dua kali.
 *
 * Dua salinan sebuah algoritma akan menyimpang. Berkas ini yang menahannya.
 *
 * Faktor kemudahan dibandingkan sebagai **pola bit**, bukan sebagai angka
 * yang dibulatkan. Ia hasil rantai penjumlahan dan perkalian pecahan yang
 * panjang; selisih satu ULP di langkah kelima menjadi selisih hari yang
 * terlihat di langkah kesepuluh, dan perbandingan yang membulatkan lebih dulu
 * akan meloloskannya.
 *
 * Berkas jejaknya dihasilkan `aikit-cli jadwal`. Kalau uji ini gagal setelah
 * penjadwal Swift disunting, hasilkan ulang berkasnya — jangan menyunting
 * salinan TypeScript-nya sampai cocok, karena itu memindahkan cacatnya alih-
 * alih memperbaikinya.
 *
 * .Deckyx
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  KEMUDAHAN_MINIMUM,
  hafalanBaru,
  jejak,
  mutu,
  perbarui,
  type Hafalan,
} from "../src/jadwal";

/** Pola bit sebuah pecahan sebagai 16 digit heksadesimal huruf kecil. */
function keHex(v: number): string {
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, v, false);
  let keluar = "";
  for (let i = 0; i < 8; i += 1) {
    keluar += buf.getUint8(i).toString(16).padStart(2, "0");
  }
  return keluar;
}

interface BarisJejak {
  deret: string;
  mutu: number;
  ulangan: number;
  jarakHari: number;
  kemudahanHex: string;
}

interface BarisMutu {
  benar: boolean;
  detik: number;
  batas: number;
  mutu: number;
}

function bacaJejak(): { jejak: BarisJejak[]; mutu: BarisMutu[] } {
  const teks = readFileSync(new URL("./jadwal-swift.txt", import.meta.url), "utf8");
  const barisJejak: BarisJejak[] = [];
  const barisMutu: BarisMutu[] = [];
  let deret = "";
  let bagianMutu = false;

  for (const mentah of teks.split("\n")) {
    const baris = mentah.replace("\r", "");
    if (!baris || baris.startsWith("#")) continue;
    if (baris.startsWith("== ")) {
      deret = baris.slice(3).trim();
      bagianMutu = deret === "mutu";
      continue;
    }
    const kolom = baris.split("\t");
    if (bagianMutu) {
      barisMutu.push({
        benar: kolom[0] === "1",
        detik: Number(kolom[1]),
        batas: Number(kolom[2]),
        mutu: Number(kolom[3]),
      });
    } else {
      barisJejak.push({
        deret,
        mutu: Number(kolom[0]),
        ulangan: Number(kolom[1]),
        jarakHari: Number(kolom[2]),
        kemudahanHex: kolom[3] ?? "",
      });
    }
  }
  return { jejak: barisJejak, mutu: barisMutu };
}

describe("penjadwal SM-2 sepadan dengan Swift", () => {
  const { jejak: barisJejak, mutu: barisMutu } = bacaJejak();

  it("berkas jejaknya terbaca dan tidak kosong", () => {
    // Jalan tanpa satu pun pernyataan bukan keberhasilan melainkan tanda
    // berkasnya tidak terbaca. Tanpa syarat ini, uji paling hijau yang
    // mungkin dihasilkan justru uji yang tidak memeriksa apa pun.
    expect(barisJejak.length).toBeGreaterThan(60);
    expect(barisMutu.length).toBeGreaterThan(60);
  });

  it("setiap langkah cocok, termasuk pola bit kemudahannya", () => {
    let h: Hafalan = hafalanBaru("x");
    let deretSekarang = "";
    for (const baris of barisJejak) {
      if (baris.deret !== deretSekarang) {
        deretSekarang = baris.deret;
        h = hafalanBaru(baris.deret);
      }
      h = perbarui(h, baris.mutu);
      const konteks = `${baris.deret} mutu=${baris.mutu}`;
      expect(h.ulangan, konteks).toBe(baris.ulangan);
      expect(h.jarakHari, konteks).toBe(baris.jarakHari);
      expect(keHex(h.kemudahan), konteks).toBe(baris.kemudahanHex);
    }
  });

  it("pemetaan hasil penilaian menjadi mutu cocok", () => {
    for (const baris of barisMutu) {
      expect(
        mutu(baris.benar, baris.detik, baris.batas),
        `benar=${baris.benar} detik=${baris.detik} batas=${baris.batas}`,
      ).toBe(baris.mutu);
    }
  });
});

describe("sifat penjadwal yang dijanjikan halaman", () => {
  it("kemudahan tidak pernah turun di bawah batas bawahnya", () => {
    let h = hafalanBaru("x");
    for (let i = 0; i < 50; i += 1) h = perbarui(h, 0);
    expect(h.kemudahan).toBeGreaterThanOrEqual(KEMUDAHAN_MINIMUM);
    expect(h.kemudahan).toBeCloseTo(KEMUDAHAN_MINIMUM, 12);
  });

  it("satu jawaban salah mengembalikan jarak ke satu hari", () => {
    let h = hafalanBaru("x");
    for (let i = 0; i < 6; i += 1) h = perbarui(h, 5);
    expect(h.jarakHari).toBeGreaterThan(100);
    h = perbarui(h, 1);
    expect(h.jarakHari).toBe(1);
    expect(h.ulangan).toBe(0);
  });

  it("salah tidak menghapus kemudahan yang sudah terkumpul", () => {
    // Yang perlu diulang adalah soalnya, bukan seluruh riwayat belajarnya.
    let h = hafalanBaru("x");
    for (let i = 0; i < 6; i += 1) h = perbarui(h, 5);
    const sebelum = h.kemudahan;
    h = perbarui(h, 1);
    expect(h.kemudahan).toBeLessThan(sebelum);
    expect(h.kemudahan).toBeGreaterThan(KEMUDAHAN_MINIMUM);
  });

  it("mutu di luar rentang dijepit, bukan ditolak", () => {
    const a = perbarui(hafalanBaru("x"), 9);
    const b = perbarui(hafalanBaru("x"), 5);
    expect(keHex(a.kemudahan)).toBe(keHex(b.kemudahan));
    const c = perbarui(hafalanBaru("x"), -4);
    const d = perbarui(hafalanBaru("x"), 0);
    expect(keHex(c.kemudahan)).toBe(keHex(d.kemudahan));
  });

  it("jejak menjumlahkan hari secara berjalan", () => {
    const titik = jejak([5, 5, 5, 5]);
    expect(titik).toHaveLength(4);
    expect(titik[0]!.hari).toBe(titik[0]!.jarakHari);
    for (let i = 1; i < titik.length; i += 1) {
      expect(titik[i]!.hari).toBe(titik[i - 1]!.hari + titik[i]!.jarakHari);
    }
  });

  it("jawaban benar yang lambat dinilai lebih rendah daripada yang cepat", () => {
    expect(mutu(true, 10, 90)).toBeGreaterThan(mutu(true, 50, 90));
    expect(mutu(true, 50, 90)).toBeGreaterThan(mutu(true, 80, 90));
    // Salah tetap salah, secepat apa pun.
    expect(mutu(false, 1, 90)).toBeLessThan(3);
    expect(mutu(false, 89, 90)).toBeLessThan(3);
  });
});
