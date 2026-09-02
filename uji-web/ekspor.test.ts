/**
 * Uji penyusun rapor CSV.
 *
 * Rapor yang gagal terbuka rapi di Excel sama tidak bergunanya dengan rapor
 * yang tidak pernah diunduh — dan kegagalannya senyap: pengguna melihat satu
 * kolom berisi seluruh baris, menyimpulkan situsnya rusak, dan tidak pernah
 * melaporkannya.
 *
 * .Deckyx
 */

import { describe, expect, it } from "vitest";

import { LABEL, barisRapor, csv, namaBerkas, sel } from "../src/ekspor";
import type { Rapor } from "../src/ekspor";
import type { Bilingual, Lang } from "../src/i18n";
import { BANK, nilai, rangkum } from "../src/bank";

const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);

const pilihDengan = (bahasa: Lang) => (p: Bilingual) => p[bahasa];

function contohRapor(): Rapor {
  const soal = BANK.slice(0, 6);
  // Jawaban sengaja dibuat separuh benar, supaya kolom hasilnya memuat kedua
  // kemungkinan dan bukan hanya satu.
  const penilaian = soal.map((s, i) => {
    const benar = i % 2 === 0;
    if (s.bentuk === "pilihan") {
      return nilai(s, {
        jenis: "pilihan",
        nilai: benar ? s.benar : (s.benar + 1) % s.pilihan.length,
      });
    }
    if (s.bentuk === "benarSalah") {
      return nilai(s, { jenis: "benarSalah", nilai: benar ? s.benar : !s.benar });
    }
    return nilai(s, { jenis: "angka", nilai: benar ? s.jawaban : s.jawaban + 1000 });
  });
  return {
    ringkasan: rangkum(soal, penilaian),
    soal,
    penilaian,
    detik: 421,
    benih: "2026",
  };
}

describe("sel", () => {
  it("mengutip sel yang memuat koma, kutip, atau baris baru", () => {
    expect(sel("ada, koma")).toBe('"ada, koma"');
    expect(sel('ada "kutip"')).toBe('"ada ""kutip"""');
    expect(sel(`dua${LF}baris`)).toBe(`"dua${LF}baris"`);
  });

  it("mengubah kosong menjadi sel kosong, bukan tulisan undefined", () => {
    expect(sel(null)).toBe("");
    expect(sel(undefined)).toBe("");
  });
});

describe("csv", () => {
  it("diawali BOM dan petunjuk pemisah, berakhiran CRLF", () => {
    const teks = csv([["a"], [1]]);
    expect(teks.startsWith("﻿")).toBe(true);
    expect(teks.split(CR + LF)[0]).toBe("﻿sep=,");
    expect(teks.endsWith(CR + LF)).toBe(true);
  });

  it("tidak meninggalkan baris dengan kutip ganjil", () => {
    // Pertanyaan dan pembahasan di bank soal memuat koma, tanda kutip
    // melengkung, dan tanda hubung panjang. Kutip ganjil berarti sel yang
    // terpotong, dan Excel akan menelan sisa berkasnya.
    const teks = csv(barisRapor(contohRapor(), pilihDengan("id")));
    for (const baris of teks.split(CR + LF)) {
      expect((baris.match(/"/g) ?? []).length % 2, baris.slice(0, 60)).toBe(0);
    }
  });
});

describe("barisRapor", () => {
  it("memuat seluruh blok yang dijanjikan", () => {
    const baris = barisRapor(contohRapor(), pilihDengan("id"));
    const tajuk = baris.filter((b) => b.length === 1).map((b) => String(b[0]));
    for (const wajib of ["RINGKASAN", "KETEPATAN PER TOPIK", "RINCIAN TIAP SOAL", "CATATAN"]) {
      expect(tajuk).toContain(wajib);
    }
  });

  it("mencatat setiap soal, satu baris masing-masing", () => {
    const rapor = contohRapor();
    const baris = barisRapor(rapor, pilihDengan("id"));
    const rincian = baris.filter((b) => b.length === 7 && typeof b[0] === "number");
    expect(rincian).toHaveLength(rapor.soal.length);
  });

  it("mencocokkan penilaian lewat kode, bukan lewat urutan", () => {
    // Sesi yang ditinggalkan di tengah menghasilkan penilaian yang lebih
    // pendek daripada soalnya. Mencocokkan berdasar indeks akan menggeser
    // seluruh baris sesudahnya tanpa satu pun galat muncul.
    const rapor = contohRapor();
    const sebagian: Rapor = {
      ...rapor,
      penilaian: [rapor.penilaian[rapor.penilaian.length - 1]!],
    };
    const baris = barisRapor(sebagian, pilihDengan("id"));
    const rincian = baris.filter((b) => b.length === 7 && typeof b[0] === "number");
    // Hanya soal terakhir yang punya hasil; sisanya kosong, bukan bergeser.
    expect(rincian[0]?.[5]).toBe("");
    expect(rincian[rincian.length - 1]?.[5]).not.toBe("");
  });

  it("mengikuti bahasa yang sedang aktif", () => {
    const rapor = contohRapor();
    const id = barisRapor(rapor, pilihDengan("id")).map((b) => String(b[0]));
    const en = barisRapor(rapor, pilihDengan("en")).map((b) => String(b[0]));
    expect(id).toContain("RINGKASAN");
    expect(en).toContain("SUMMARY");
    expect(en).not.toContain("RINGKASAN");
  });

  it("mencatat bahasa rapornya di kepala berkas", () => {
    // Rapor yang beredar lepas dari halamannya tetap harus bisa ditelusuri
    // asalnya, termasuk bahasa mana yang dipakai saat ia dibuat.
    const rapor = contohRapor();
    for (const kode of ["id", "en"] as const) {
      const baris = barisRapor(rapor, pilihDengan(kode));
      const cap = baris.find((b) => b[0] === LABEL.bahasa[kode]);
      expect(cap?.[1], kode).toBe(kode);
    }
  });

  it("setiap label punya kedua bahasa dan keduanya berbeda", () => {
    for (const [kunci, pasangan] of Object.entries(LABEL)) {
      expect(pasangan.id.trim(), kunci).not.toBe("");
      expect(pasangan.en.trim(), kunci).not.toBe("");
      // "no" adalah singkatan nomor dan sama di kedua bahasa; sisanya harus
      // benar-benar diterjemahkan.
      if (kunci !== "no") expect(pasangan.id, kunci).not.toBe(pasangan.en);
    }
  });
});

describe("namaBerkas", () => {
  it("menyebutkan benih dan nilainya", () => {
    const nama = namaBerkas(contohRapor());
    expect(nama).toContain("ind323-rapor");
    expect(nama).toContain("benih2026");
    expect(nama).toContain("nilai");
    expect(nama.endsWith(".csv")).toBe(true);
  });

  it("membersihkan benih yang ditulis pengguna", () => {
    // Benih berasal dari isian bebas. Titik dua dan garis miring membuat
    // unduhan gagal senyap di Windows.
    const rapor = { ...contohRapor(), benih: 'a/b\\c:d*e?"f<g>h|i' };
    const nama = namaBerkas(rapor);
    expect(nama).not.toMatch(/[:/\\?*"<>|]/);
    expect(nama).toContain("benihabcdefghi");
  });

  it("tidak menghasilkan nama kosong untuk benih yang seluruhnya terbuang", () => {
    const rapor = { ...contohRapor(), benih: "///" };
    expect(namaBerkas(rapor)).toContain("benih0");
  });
});
