/**
 * Uji yang menolak prosa Indonesia yang tidak lewat kamus.
 *
 * # Kenapa uji kamus saja tidak cukup
 *
 * Uji dwibahasa yang sudah ada memeriksa isi kamus: tiap pasangan punya kedua
 * bahasa, keduanya berbeda, penanda formatnya sepadan. Seluruhnya hijau — dan
 * seluruhnya tetap hijau sementara enam paragraf di markup dan tiga keterangan
 * gambar tidak pernah lewat kamus sama sekali.
 *
 * Kegagalan itu tidak bisa dilihat dari dalam kamus, karena teks yang hilang
 * memang bukan bagian darinya. Yang bisa melihatnya hanya pemeriksaan dari
 * arah sebaliknya: membaca berkas antarmukanya, lalu menolak kalimat Indonesia
 * yang berdiri sendiri di sana.
 *
 * Keterangan gambar yang paling parah akibatnya. `Gambar` menuntut prop
 * `terang`, dan teks itu menjadi `aria-label`-nya — sehingga pengguna pembaca
 * layar berbahasa Inggris mendengar kalimat Indonesia, dan itu justru pengguna
 * yang paling bergantung pada keterangan tersebut.
 *
 * .Deckyx
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Kata Indonesia yang tidak mungkin muncul di kode.
 *
 * Sengaja kata fungsi — kata sambung, kata depan, kata ganti. Kata benda
 * seperti "soal" dan "sesi" dipakai sebagai nama peubah di seluruh berkas ini,
 * dan memasukkannya akan membuat ujinya berteriak pada kode yang benar.
 */
const KATA = /\b(yang|dengan|adalah|tidak|untuk|dari|pada|karena|jadi|bisa|akan|sebuah|supaya|sehingga|kalau|tetapi|atau|dan)\b/i;

/** Berkas antarmuka yang isinya sampai ke layar. */
function berkasAntarmuka(): string[] {
  const keluar: string[] = [];
  for (const dir of ["src", join("src", "viz"), join("src", "lib")]) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (f.isFile() && f.name.endsWith(".svelte")) keluar.push(join(dir, f.name));
    }
  }
  return keluar;
}

/**
 * Membuang segala yang bukan teks yang sampai ke layar.
 *
 * Komentar dibuang karena seluruh berkas ini memang berkomentar panjang dalam
 * Bahasa Indonesia, dan itu disengaja: yang membacanya pengembang, bukan
 * pengunjung.
 */
function tanpaKomentar(isi: string): string {
  return isi
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

describe("prosa antarmuka lewat kamus", () => {
  it("tidak ada kalimat Indonesia yang berdiri sendiri di markup", () => {
    const pelanggaran: string[] = [];

    for (const berkas of berkasAntarmuka()) {
      const isi = tanpaKomentar(readFileSync(berkas, "utf8"));
      // Bagian <script> dilewati: nama peubah dan pesan galat pengembang
      // bukan teks yang sampai ke layar.
      const markup = isi.replace(/<script[\s\S]*?<\/script>/g, "");

      for (const [i, baris] of markup.split("\n").entries()) {
        const t = baris.trim();
        if (t === "" || !KATA.test(t)) continue;
        // Baris yang sudah memanggil pemilih teks memang sedang menerjemahkan.
        if (t.includes("pilih(")) continue;
        pelanggaran.push(`${berkas}:${i + 1}  ${t.slice(0, 70)}`);
      }
    }

    expect(pelanggaran, pelanggaran.join("\n")).toEqual([]);
  });

  it("keterangan dan judul tiap gambar diambil dari kamus", () => {
    // `terang` menjadi `aria-label` gambarnya. Keterangan yang dibekukan
    // sebagai untai biasa tidak akan pernah berganti bahasa, dan pengguna
    // pembaca layar tidak punya jalan lain menuju isinya.
    for (const berkas of berkasAntarmuka().filter((f) => f.includes("viz"))) {
      const isi = tanpaKomentar(readFileSync(berkas, "utf8"));
      if (!isi.includes("<Gambar")) continue;

      const judul = isi.match(/judul=(\{[^}]*\}|"[^"]*")/g) ?? [];
      for (const j of judul) {
        expect(j.includes("pilih("), `${berkas}: ${j}`).toBe(true);
      }
      // Keterangannya dirakit di <script>, jadi yang diperiksa deklarasinya.
      const terang = isi.match(/const terang\s*=[\s\S]*?;\n/);
      if (terang) {
        expect(terang[0].includes("pilih("), `${berkas}: terang`).toBe(true);
      }
    }
  });
});
