/**
 * Uji sisi peramban.
 *
 * Mesin dan kunci jawabannya sudah diuji di Swift, dan diadu terhadap 3.796
 * pernyataan berpola bit. Yang diuji di sini adalah lapisan yang tidak
 * tersentuh keduanya: apakah salinan pengacak di TypeScript benar-benar
 * menghasilkan sesi yang sama dengan Swift.
 *
 * Pertanyaan itu bukan pertanyaan gaya. Kalau keduanya berbeda, sesi berbenih
 * sama akan berisi soal yang berbeda antara yang disusun saat build dan yang
 * disusun peramban — dan seluruh gagasan "sesi yang bisa diulang" runtuh tanpa
 * satu pun galat muncul.
 *
 * # Kenapa direktorinya bernama `uji-web`, bukan `tests`
 *
 * Paket Swift menuntut ujinya berada di `Tests/` dengan T besar. Pada
 * filesystem Windows yang tidak peka huruf besar-kecil, `tests/` dan `Tests/`
 * adalah direktori yang sama — sehingga berkas ini tercatat di dalam `Tests/`
 * dan lenyap dari pandangan Vitest begitu repositorinya diperiksa di Linux.
 * Nama yang berbeda menghilangkan seluruh kelas kekeliruan itu.
 *
 * .Deckyx
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BANK,
  DETIK_PER_SOAL,
  SESI,
  SplitMix64,
  bacaAngka,
  jam,
  nilai,
  rangkum,
  susunSesi,
} from "../src/bank";
import type { Penilaian } from "../src/bank";
import { MATERI } from "../src/materi";

// ---------------------------------------------------------------------------
// Pengacak
// ---------------------------------------------------------------------------

describe("SplitMix64", () => {
  it("menghasilkan deret rujukan", () => {
    const r = new SplitMix64(0n);
    expect(r.u64().toString(16).padStart(16, "0")).toBe("e220a8397b1dcdaf");
    expect(r.u64().toString(16).padStart(16, "0")).toBe("6e789e6aa1b965f4");
  });

  it("sepadan dengan vektor uji lintas bahasa", () => {
    // Vektor yang sama dipakai Rust, Go, PL/SQL, Lua, dan Swift. Salinan
    // TypeScript ini adalah yang keenam, dan ia harus lolos vektor yang sama.
    const isi = readFileSync("conformance/vectors/rng.tsv", "utf8");
    let diperiksa = 0;
    for (const baris of isi.split(/\r?\n/)) {
      if (!baris || baris.startsWith("#")) continue;
      const kol = baris.split("\t");
      const benih = BigInt(kol[0]!);
      const indeks = Number(kol[1]);
      const r = new SplitMix64(benih);
      let u = 0n;
      for (let i = 0; i <= indeks; i += 1) u = r.u64();
      expect(u.toString(16).padStart(16, "0"), `benih ${kol[0]} indeks ${indeks}`).toBe(kol[2]);
      diperiksa += 1;
    }
    expect(diperiksa).toBe(72);
  });

  it("tidak pernah mencapai batas atasnya", () => {
    const r = new SplitMix64(3n);
    for (let i = 0; i < 500; i += 1) {
      expect(r.dibawah(10n)).toBeLessThan(10n);
    }
    expect(r.dibawah(0n)).toBe(0n);
  });

  it("pengacakan mempertahankan seluruh isinya", () => {
    const r = new SplitMix64(9n);
    const isi = Array.from({ length: 50 }, (_, i) => i);
    const asli = [...isi];
    r.acak(isi);
    expect([...isi].sort((a, b) => a - b)).toEqual(asli);
    expect(isi).not.toEqual(asli);
  });

  it("larik pendek aman diacak", () => {
    const r = new SplitMix64(1n);
    const kosong: number[] = [];
    r.acak(kosong);
    expect(kosong).toEqual([]);
    const satu = [7];
    r.acak(satu);
    expect(satu).toEqual([7]);
  });
});

// ---------------------------------------------------------------------------
// Kesepadanan dengan Swift
// ---------------------------------------------------------------------------

describe("kesepadanan sesi dengan Swift", () => {
  /**
   * Berkas rujukan dihasilkan `aikit-cli sesi <benih> 12` dan disimpan di
   * repositori. Menghasilkannya ulang saat uji akan menuntut toolchain Swift
   * terpasang, dan uji yang butuh Docker 5 GB akan berhenti dijalankan orang
   * dalam hitungan hari.
   */
  const rujukan = readFileSync("uji-web/sesi-swift.txt", "utf8");

  const kelompok: { benih: string; baris: string[] }[] = [];
  for (const baris of rujukan.split(/\r?\n/)) {
    if (baris.startsWith("=== benih ")) {
      kelompok.push({ benih: baris.slice(10).trim(), baris: [] });
    } else if (baris.trim() && !baris.startsWith("Build") && kelompok.length > 0) {
      kelompok[kelompok.length - 1]!.baris.push(baris);
    }
  }

  it("berkas rujukan memuat beberapa benih", () => {
    expect(kelompok.length).toBeGreaterThanOrEqual(4);
    for (const k of kelompok) {
      expect(k.baris.length, `benih ${k.benih}`).toBe(12);
    }
  });

  it.each(kelompok.map((k) => [k.benih, k] as const))(
    "sesi benih %s identik dengan yang disusun Swift",
    (_benih, k) => {
      const sesi = susunSesi(12, BigInt(k.benih));
      const dapat = sesi.soal.map((s) =>
        s.bentuk === "pilihan" ? `${s.kode} :: ${s.benar} :: ${s.pilihan.join("|")}` : s.kode,
      );
      expect(dapat).toEqual(k.baris);
    },
  );
});

// ---------------------------------------------------------------------------
// Penyusun sesi
// ---------------------------------------------------------------------------

describe("penyusun sesi", () => {
  it("benih sama menghasilkan sesi sama", () => {
    const a = susunSesi(10, 42n);
    const b = susunSesi(10, 42n);
    expect(a.soal.map((s) => s.kode)).toEqual(b.soal.map((s) => s.kode));
  });

  it("benih berbeda menghasilkan urutan berbeda", () => {
    const a = susunSesi(15, 1n);
    const b = susunSesi(15, 2n);
    expect(a.soal.map((s) => s.kode)).not.toEqual(b.soal.map((s) => s.kode));
  });

  it("penyaring sesi kuliah bekerja", () => {
    const s = susunSesi(50, 3n, 3);
    expect(s.soal.length).toBeGreaterThan(0);
    expect(s.soal.every((x) => x.sesi === 3)).toBe(true);
  });

  it("meminta lebih banyak daripada yang tersedia tidak menabrak", () => {
    expect(susunSesi(9999, 5n).soal.length).toBe(BANK.length);
    const kosong = susunSesi(0, 5n);
    expect(kosong.soal).toEqual([]);
    expect(kosong.batasDetik).toBe(0);
  });

  it("kunci jawaban tetap menunjuk teks yang sama setelah pilihannya diacak", () => {
    // Tanpa ini, jawaban benar akan selalu berada di posisi yang sama dan yang
    // dihafal mahasiswa adalah posisinya, bukan materinya.
    let berpindah = 0;
    for (let benih = 0n; benih < 30n; benih += 1n) {
      for (const s of susunSesi(BANK.length, benih).soal) {
        if (s.bentuk !== "pilihan") continue;
        const asli = BANK.find((x) => x.kode === s.kode);
        if (!asli || asli.bentuk !== "pilihan") continue;
        expect(s.pilihan[s.benar], s.kode).toBe(asli.pilihan[asli.benar]);
        expect([...s.pilihan].sort()).toEqual([...asli.pilihan].sort());
        if (s.benar !== asli.benar) berpindah += 1;
      }
    }
    expect(berpindah).toBeGreaterThan(0);
  });

  it("batas waktu sebanding dengan jumlah soal", () => {
    expect(susunSesi(10, 1n).batasDetik).toBe(10 * DETIK_PER_SOAL);
  });
});

// ---------------------------------------------------------------------------
// Penilaian
// ---------------------------------------------------------------------------

describe("penilaian", () => {
  const pilihan = BANK.find((s) => s.bentuk === "pilihan")!;
  const angka = BANK.find((s) => s.bentuk === "angka")!;
  const bs = BANK.find((s) => s.bentuk === "benarSalah")!;

  it("pilihan ganda dinilai menurut indeksnya", () => {
    if (pilihan.bentuk !== "pilihan") throw new Error("bentuk salah");
    expect(nilai(pilihan, { jenis: "pilihan", nilai: pilihan.benar }).benar).toBe(true);
    expect(nilai(pilihan, { jenis: "pilihan", nilai: (pilihan.benar + 1) % pilihan.pilihan.length }).benar).toBe(false);
  });

  it("benar-salah dinilai menurut nilainya", () => {
    if (bs.bentuk !== "benarSalah") throw new Error("bentuk salah");
    expect(nilai(bs, { jenis: "benarSalah", nilai: bs.benar }).benar).toBe(true);
    expect(nilai(bs, { jenis: "benarSalah", nilai: !bs.benar }).benar).toBe(false);
  });

  it("soal berangka dinilai dengan toleransi", () => {
    if (angka.bentuk !== "angka") throw new Error("bentuk salah");
    expect(nilai(angka, { jenis: "angka", nilai: angka.jawaban }).benar).toBe(true);
    expect(nilai(angka, { jenis: "angka", nilai: angka.jawaban + angka.toleransi / 2 }).benar).toBe(true);
    expect(nilai(angka, { jenis: "angka", nilai: angka.jawaban + angka.toleransi * 3 }).benar).toBe(false);
  });

  it("jawaban kosong dan tak berhingga dinilai salah", () => {
    expect(nilai(pilihan, { jenis: "kosong" }).benar).toBe(false);
    expect(nilai(angka, { jenis: "angka", nilai: NaN }).benar).toBe(false);
    expect(nilai(angka, { jenis: "angka", nilai: Infinity }).benar).toBe(false);
  });

  it("bentuk jawaban yang tidak cocok dinilai salah, bukan menabrak", () => {
    expect(nilai(pilihan, { jenis: "angka", nilai: 1 }).benar).toBe(false);
    expect(nilai(angka, { jenis: "benarSalah", nilai: true }).benar).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------

describe("ringkasan", () => {
  it("nilai dihitung benar", () => {
    const sesi = susunSesi(4, 11n);
    const penilaian: Penilaian[] = sesi.soal.map((s, i) => ({ kode: s.kode, benar: i < 3 }));
    const r = rangkum(sesi.soal, penilaian);
    expect(r.benar).toBe(3);
    expect(r.total).toBe(4);
    expect(r.nilai).toBe(75);
  });

  it("sesi kosong tidak membagi dengan nol", () => {
    const r = rangkum([], []);
    expect(r.nilai).toBe(0);
    expect(r.perTopik).toEqual([]);
  });

  it("topik terlemah muncul lebih dulu", () => {
    // Mengurutkannya menurut nama akan membuat bagian yang paling perlu
    // diulang tenggelam di tengah daftar.
    const sesi = susunSesi(20, 13n);
    const penilaian: Penilaian[] = sesi.soal.map((s, i) => ({ kode: s.kode, benar: i % 3 !== 0 }));
    const r = rangkum(sesi.soal, penilaian);
    const ketepatan = r.perTopik.map((t) => t.benar / t.total);
    expect(ketepatan).toEqual([...ketepatan].sort((a, b) => a - b));
  });
});

// ---------------------------------------------------------------------------
// Pembantu
// ---------------------------------------------------------------------------

describe("pembantu", () => {
  it("membaca koma sebagai pemisah desimal", () => {
    // Papan ketik Indonesia dan kebiasaan menulis di kelas memakai koma.
    expect(bacaAngka("0,79")).toBe(0.79);
    expect(bacaAngka("0.79")).toBe(0.79);
    expect(bacaAngka("  1,5  ")).toBe(1.5);
    expect(bacaAngka("kucing")).toBeNaN();
    expect(bacaAngka("")).toBeNaN();
  });

  it("memformat waktu", () => {
    expect(jam(0)).toBe("00:00");
    expect(jam(90)).toBe("01:30");
    expect(jam(900)).toBe("15:00");
    expect(jam(-5)).toBe("00:00");
  });
});

// ---------------------------------------------------------------------------
// Isi bank dan materi
// ---------------------------------------------------------------------------

describe("isi bank", () => {
  it("kodenya unik", () => {
    const kode = BANK.map((s) => s.kode);
    expect(new Set(kode).size).toBe(kode.length);
  });

  it("setiap sesi kuliah punya minimal satu soal", () => {
    // Bank yang bolong pada satu sesi akan menghasilkan latihan yang diam-diam
    // melewatkan seluruh materinya.
    const bersoal = new Set(BANK.map((s) => s.sesi));
    for (const s of SESI) {
      expect(bersoal.has(s.nomor), `sesi ${s.nomor}`).toBe(true);
    }
  });

  it("setiap soal punya pembahasan yang benar-benar menjelaskan", () => {
    for (const s of BANK) {
      expect(s.pertanyaan.length, s.kode).toBeGreaterThan(20);
      // Soal tanpa pembahasan hanya menguji, tidak mengajari.
      expect(s.pembahasan.length, s.kode).toBeGreaterThan(80);
    }
  });

  it("ketiga bentuk soal terwakili", () => {
    const bentuk = new Set(BANK.map((s) => s.bentuk));
    expect(bentuk).toEqual(new Set(["pilihan", "angka", "benarSalah"]));
  });

  it("kunci soal berangka bukan bilangan bulat semua", () => {
    // Kalau seluruh kuncinya bilangan bulat, besar kemungkinan ia diketik
    // tangan alih-alih dihitung — dan itu persis yang ingin dicegah.
    const angka = BANK.filter((s) => s.bentuk === "angka");
    const pecahan = angka.filter((s) => s.bentuk === "angka" && !Number.isInteger(s.jawaban));
    expect(angka.length).toBeGreaterThanOrEqual(10);
    expect(pecahan.length).toBeGreaterThan(0);
  });
});

describe("isi materi", () => {
  it("keempat belas sesi terliput", () => {
    expect(MATERI.map((m) => m.sesi)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it("setiap sesi punya tiga bagian yang benar-benar terisi", () => {
    for (const m of MATERI) {
      expect(m.judul.length, `sesi ${m.sesi}`).toBeGreaterThan(5);
      expect(m.inti.length, `sesi ${m.sesi}`).toBeGreaterThan(150);
      expect(m.keliru.length, `sesi ${m.sesi}`).toBeGreaterThan(120);
      expect(m.diuji.length, `sesi ${m.sesi}`).toBeGreaterThan(80);
    }
  });

  it("judul materi sepadan dengan nama sesi di bank", () => {
    // Dua daftar yang saling menyebut harus tetap sepadan. Bank dihasilkan
    // Swift, materi ditulis tangan, dan tanpa uji ini keduanya akan menyimpang.
    expect(MATERI.length).toBe(SESI.length);
    for (const m of MATERI) {
      expect(SESI.some((s) => s.nomor === m.sesi), `sesi ${m.sesi}`).toBe(true);
    }
  });
});
