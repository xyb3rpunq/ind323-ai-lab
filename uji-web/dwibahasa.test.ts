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

import { T } from "../src/i18n";

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

/**
 * Membuang komentar, `<script>`, dan `<style>`, menyisakan markup saja.
 *
 * `<style>` ikut dibuang karena pemilih CSS di berkas ini memang bernama
 * Indonesia — `.salindia__judul`, `.deck__kaki` — dan nama kelas tidak pernah
 * sampai ke mata siapa pun.
 */
function markupSaja(isi: string): string {
  return (
    tanpaKomentar(isi)
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<style[\s\S]*?<\/style>/g, "")
      // Panah fungsi diganti supaya `>` di dalamnya tidak dikira penutup tag.
      // Tanpa ini, `onclick={() => ...}` memotong tag di tengah dan seluruh
      // sisa atributnya terbaca sebagai teks yang tampil di layar.
      .replace(/=>/g, "→")
  );
}

/**
 * Kata yang boleh berdiri sendiri sebagai teks di markup.
 *
 * Semuanya nama diri, singkatan, atau satuan — kata yang memang sama di kedua
 * bahasa, sehingga menerjemahkannya justru salah.
 */
const DIIZINKAN = new Set([
  "IND323",
  "AI",
  "Deckyx",
  "ID",
  "EN",
  "CSV",
  "PDF",
  "SM",
  "Swift",
  "Rust",
  "Lua",
  "Python",
  "Go",
  "TypeScript",
  "Excel",
  "GitHub",
  "Lab",
  // Nama orang.
  "Daniel",
  "Hutajulu",
  // Nama tuts papan ketik: yang tercetak di tutsnya sama di kedua bahasa,
  // dan menerjemahkannya justru membuat petunjuknya salah.
  "PageDown",
  "PageUp",
  "Home",
  "End",
  "Esc",
  "Enter",
]);

/**
 * Kata sepanjang tiga huruf atau lebih di sebuah potongan teks.
 *
 * Angka ikut dianggap bagian kata, supaya "IND323" terbaca utuh dan cocok
 * dengan daftar yang diizinkan — bukan terpecah menjadi "IND" yang tidak ada
 * di daftar mana pun. Entitas HTML seperti `&nbsp;` dibuang lebih dulu: ia
 * spasi, bukan kata.
 */
function kata(teks: string): string[] {
  const bersih = teks.replace(/&[a-z]+;/g, " ");
  const cocok = bersih.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9]{2,}/g) ?? [];
  return cocok.filter((k) => !DIIZINKAN.has(k));
}

describe("tidak ada teks yang membeku di markup", () => {
  it("simpul teks di markup selalu lewat ekspresi, bukan ditulis langsung", () => {
    // Teks yang ditulis langsung di markup tidak punya jalan menuju kamus.
    // Ia tetap terbaca, hanya selalu dalam satu bahasa — dan bocoran seperti
    // itu justru paling sulit terlihat oleh yang menulisnya, karena bahasa
    // yang bocor adalah bahasa yang dipakainya sehari-hari.
    const pelanggaran: string[] = [];

    for (const berkas of berkasAntarmuka()) {
      let markup = markupSaja(readFileSync(berkas, "utf8"));
      // Ekspresi Svelte dibuang lebih dulu, berulang sampai yang bersarang
      // ikut habis; sisanya simpul teks yang benar-benar ditulis di markup.
      let sebelum = "";
      while (sebelum !== markup) {
        sebelum = markup;
        markup = markup.replace(/\{[^{}]*\}/g, " ");
      }
      markup = markup.replace(/<[^>]*>/g, "\n");

      for (const [i, baris] of markup.split("\n").entries()) {
        const k = kata(baris);
        if (k.length > 0) pelanggaran.push(`${berkas}: ${k.join(" ")}  |  ${baris.trim().slice(0, 60)}`);
        void i;
      }
    }

    expect(pelanggaran, pelanggaran.join("\n")).toEqual([]);
  });

  it("untai di dalam ekspresi markup tidak memuat prosa", () => {
    // `{benar ? "Benar" : "Salah"}` lolos pemeriksaan simpul teks di atas —
    // ia memang sebuah ekspresi. Yang membuatnya bocoran adalah isinya.
    const pelanggaran: string[] = [];
    const KECUALI = /^[\s\d.,:;%/·—–-]*$/;

    for (const berkas of berkasAntarmuka()) {
      const markup = markupSaja(readFileSync(berkas, "utf8"));
      // Hanya simpul teks — yang berada di antara `>` dan `<`. Untai di dalam
      // tag adalah nilai atribut dan penangan peristiwa: `layar = "beranda"`
      // dan `class="tombol"` tidak pernah dibaca siapa pun, dan menuntutnya
      // lewat kamus akan membuat ujinya berteriak pada kode yang benar.
      for (const simpul of markup.matchAll(/>([^<]*)</g)) {
        for (const ekspresi of simpul[1]!.match(/\{[^{}]*\}/g) ?? []) {
          // Blok kendali Svelte — `{#if}`, `{:else}`, `{/each}`, `{@const}` —
          // tidak menampilkan untainya, ia membandingkannya. Nilai enum di
          // dalamnya memang bukan teks yang dibaca siapa pun.
          if (/^\{[#:/@]/.test(ekspresi)) continue;
          for (const untai of ekspresi.match(/"[^"]*"|'[^']*'/g) ?? []) {
            const isi = untai.slice(1, -1);
            if (KECUALI.test(isi)) continue;
            if (kata(isi).length > 0) pelanggaran.push(`${berkas}: ${untai}`);
          }
        }
      }
    }

    expect(pelanggaran, pelanggaran.join("\n")).toEqual([]);
  });

  it("atribut yang dibaca manusia diambil dari kamus", () => {
    // `placeholder`, `title`, `alt` dan `aria-label` sampai ke pengguna sama
    // seperti teks biasa — dan `aria-label` justru hanya sampai ke pengguna
    // yang paling tidak punya jalan lain menuju isinya.
    const pelanggaran: string[] = [];
    const ATRIBUT = /\s(placeholder|title|alt|aria-label)=("[^"]*"|'[^']*')/g;

    for (const berkas of berkasAntarmuka()) {
      const markup = markupSaja(readFileSync(berkas, "utf8"));
      for (const c of markup.matchAll(ATRIBUT)) {
        // Bagian yang sudah berupa ekspresi dibuang: `aria-label="{judul}"`
        // memang sedang mengambil teksnya dari tempat lain.
        const isi = c[2]!.slice(1, -1).replace(/\{[^{}]*\}/g, " ");
        if (kata(isi).length > 0) pelanggaran.push(`${berkas}: ${c[1]}=${c[2]}`);
      }
    }

    expect(pelanggaran, pelanggaran.join("\n")).toEqual([]);
  });
});

describe("kamus antarmuka", () => {
  const isian = Object.entries(T);

  it("setiap entri terisi di kedua bahasa", () => {
    for (const [kunci, pasangan] of isian) {
      expect(pasangan.id.trim(), kunci).not.toBe("");
      expect(pasangan.en.trim(), kunci).not.toBe("");
    }
  });

  it("penanda format sepadan antara kedua bahasa", () => {
    // `%B benar dari %T soal` diterjemahkan menjadi kalimat dengan urutan kata
    // yang berbeda, dan penanda yang terjatuh saat menerjemahkan menghasilkan
    // kalimat yang kehilangan angkanya — tanpa satu pun galat.
    for (const [kunci, pasangan] of isian) {
      const penanda = (t: string) => (t.match(/%[A-Z]/g) ?? []).sort();
      expect(penanda(pasangan.en), kunci).toEqual(penanda(pasangan.id));
    }
  });

  it("terjemahannya benar-benar diterjemahkan, bukan disalin", () => {
    // Sebagian entri memang sama di kedua bahasa: singkatan, nama diri, dan
    // istilah yang tidak punya padanan. Semuanya didaftar di sini satu per
    // satu, supaya entri baru yang lupa diterjemahkan tidak ikut lolos hanya
    // karena "kebetulan sama" pernah dimaafkan sekali.
    const BOLEH_SAMA = new Set<string>([]);
    const sama = isian
      .filter(([kunci, p]) => p.id === p.en && !BOLEH_SAMA.has(kunci))
      .map(([kunci, p]) => `${kunci}: ${p.id}`);
    expect(sama, sama.join("\n")).toEqual([]);
  });
});

describe("kepala dokumen ikut berganti bahasa", () => {
  it("judul tab diterapkan di tempat yang sama dengan atribut lang", () => {
    // Judul tab tidak terlihat di halaman, jadi ia satu-satunya teks yang bisa
    // tertinggal berbulan-bulan tanpa ada yang menyadarinya. Yang menjaganya
    // bukan ingatan, melainkan letaknya: selama ia diterapkan di fungsi yang
    // sama dengan `lang`, tidak ada jalan mengganti bahasa yang melewatinya.
    const isi = readFileSync(join("src", "i18n.svelte.ts"), "utf8");
    const fungsi = isi.match(/function terapkanKepala[\s\S]*?\n}/);
    expect(fungsi, "terapkanKepala tidak ditemukan").not.toBeNull();
    expect(fungsi![0]).toContain("documentElement.lang");
    expect(fungsi![0]).toContain("document.title");

    // Dan tidak ada tempat lain yang menyetel salah satunya sendirian.
    const langsung = isi.split("\n").filter((b) => {
      const t = b.trim();
      if (t.startsWith("//") || t.startsWith("*")) return false;
      return t.includes("documentElement.lang") || t.includes("document.title");
    });
    expect(langsung.length, langsung.join("\n")).toBe(2);
  });
});
