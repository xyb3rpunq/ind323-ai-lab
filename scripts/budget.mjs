/**
 * Anggaran ukuran berkas terbitan.
 *
 * Batasnya diperiksa di CI dan build gagal bila terlampaui — bukan sekadar niat
 * baik yang dicetak lalu diabaikan. Ukuran situs tidak pernah membesar karena
 * satu keputusan besar; ia membesar beberapa kilobita sekali waktu, dan tanpa
 * pagar seperti ini tidak ada satu pun perubahan yang terasa cukup buruk untuk
 * ditolak.
 *
 * .Deckyx
 */

import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(AKAR, "dist");

/** Anggaran per jenis berkas, dalam kilobita setelah gzip. */
const ANGGARAN = {
  ".js": 60,
  ".css": 20,
  ".html": 12,
};

/** Anggaran seluruh berkas yang mungkin diunduh satu pengunjung. */
// Jauh lebih kecil daripada dua situs pendahulunya, dan itu langsung
// merupakan hasil keputusan menjalankan Swift saat build alih-alih di
// peramban: yang dikirim hanyalah bank soal sebagai JSON, bukan runtime
// bahasanya. Anggaran yang ketat menjaga keputusan itu tidak pelan-pelan
// dibatalkan.
const ANGGARAN_TOTAL = 120;

function semuaBerkas(dir) {
  const keluar = [];
  for (const entri of readdirSync(dir, { withFileTypes: true })) {
    const jalur = join(dir, entri.name);
    if (entri.isDirectory()) keluar.push(...semuaBerkas(jalur));
    else keluar.push(jalur);
  }
  return keluar;
}

const baris = [];
let total = 0;
let terlampaui = 0;

for (const jalur of semuaBerkas(DIST).sort()) {
  // Peta sumber tidak pernah diunduh pengunjung biasa; ia hanya diambil saat
  // panel pengembang terbuka. Memasukkannya ke anggaran akan menghukum
  // keputusan yang justru mempermudah orang lain membaca kode ini.
  if (jalur.endsWith(".map")) continue;

  const isi = readFileSync(jalur);
  const kb = gzipSync(isi, { level: 9 }).length / 1024;
  const jenis = extname(jalur);
  const batas = ANGGARAN[jenis];
  const nama = relative(DIST, jalur).replace(/\\/g, "/");

  total += kb;
  const lewat = batas !== undefined && kb > batas;
  if (lewat) terlampaui += 1;

  baris.push({
    berkas: nama,
    gzip: `${kb.toFixed(1)} KB`,
    anggaran: batas === undefined ? "—" : `${batas} KB`,
    status: batas === undefined ? "—" : lewat ? "LEWAT" : "ok",
  });
}

console.table(baris);

const totalTeks = `${total.toFixed(1)} KB`;
const totalLewat = total > ANGGARAN_TOTAL;
console.log(
  `\nTotal seluruh berkas: ${totalTeks}  (anggaran ${ANGGARAN_TOTAL} KB) — ` +
    (totalLewat ? "LEWAT" : "ok"),
);

// Direktori terbitan yang kosong bukan keberhasilan melainkan tanda build-nya
// tidak berjalan. Tanpa pemeriksaan ini, CI akan hijau justru ketika tidak ada
// yang dihasilkan.
if (baris.length === 0) {
  console.error("Tidak ada satu pun berkas di dist/. Build tidak berjalan.");
  process.exit(2);
}

if (terlampaui > 0 || totalLewat) {
  console.error(`\nAnggaran terlampaui pada ${terlampaui} berkas.`);
  process.exit(1);
}

console.log("Seluruh anggaran terpenuhi.");

// Berkas wajib yang keberadaannya menentukan apakah situsnya bisa ditemukan.
// Hilangnya tidak menggagalkan build maupun uji mana pun; yang terjadi hanya
// situsnya perlahan hilang dari mesin pencari, berbulan-bulan kemudian.
for (const wajib of ["index.html", "404.html", "robots.txt"]) {
  try {
    statSync(join(DIST, wajib));
  } catch {
    console.error(`Berkas wajib hilang dari hasil build: ${wajib}`);
    process.exit(3);
  }
}
console.log("Seluruh berkas wajib ada.");
