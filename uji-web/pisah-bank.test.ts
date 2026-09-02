/**
 * Uji pemisahan pembahasan dari bank soal.
 *
 * Yang diuji di sini bukan bentuk berkasnya, melainkan satu hal: pemisahannya
 * tidak menghilangkan, menukar, atau mengarang apa pun. Karena itu ujinya
 * menyatukan kembali hasil pemisahan dan menuntut ia sama persis dengan bank
 * yang masuk — pemeriksaan yang jauh lebih kuat daripada memeriksa jumlah
 * kunci atau mencocokkan beberapa contoh.
 *
 * Berkas turunan yang tersimpan ikut diperiksa terhadap sumbernya, dengan
 * alasan yang sama seperti CI memeriksa `bank.json` terhadap Swift: turunan
 * yang lupa dihasilkan ulang tetap terbaca masuk akal, hanya menjelaskan soal
 * yang sudah tidak ada.
 *
 * .Deckyx
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { INTI, PEMBAHASAN, SUMBER, keJson, pisah, satukan } from "../scripts/pisah-bank.mjs";
import type { BankMentah } from "../scripts/pisah-bank.mjs";

const bank = JSON.parse(readFileSync(SUMBER, "utf8")) as BankMentah;

describe("pisah bank", () => {
  it("menyatukan kembali menghasilkan bank yang sama persis", () => {
    const { inti, pembahasan } = pisah(bank);
    expect(satukan(inti, pembahasan)).toEqual(bank);
  });

  it("inti tidak lagi memuat satu pun pembahasan", () => {
    const { inti } = pisah(bank);
    for (const s of inti.soal) {
      expect(Object.keys(s), s.kode).not.toContain("pembahasan");
    }
    // Dan tidak kehilangan apa pun yang lain.
    expect(inti.soal.length).toBe(bank.soal.length);
    expect(inti.sesi).toEqual(bank.sesi);
  });

  it("tiap soal punya pembahasan, dan tiap pembahasan punya soal", () => {
    const { pembahasan } = pisah(bank);
    const kode = bank.soal.map((s) => s.kode);
    expect(Object.keys(pembahasan).sort()).toEqual([...kode].sort());
  });

  it("berkas turunan yang tersimpan masih mutakhir", () => {
    // Turunan yang lupa dihasilkan ulang tetap terbaca masuk akal, hanya
    // menjelaskan soal yang sudah tidak ada di banknya.
    const { inti, pembahasan } = pisah(bank);
    expect(readFileSync(INTI, "utf8")).toBe(keJson(inti));
    expect(readFileSync(PEMBAHASAN, "utf8")).toBe(keJson(pembahasan));
  });

  it("pembahasan berkunci kode, bukan urutan", () => {
    // Kunci berupa indeks akan menggeser seluruh pembahasan sesudahnya begitu
    // satu soal disisipkan di tengah, dan yang tergeser tetap tampil masuk
    // akal — hanya menjelaskan soal yang salah.
    const disisipi = {
      sesi: bank.sesi,
      soal: [
        ...bank.soal.slice(0, 1),
        ...bank.soal
          .slice(1, 2)
          .map((s) => ({ ...s, kode: "SISIPAN", pembahasan: { id: "sisipan", en: "inserted" } })),
        ...bank.soal.slice(1),
      ],
    };
    const { pembahasan } = pisah(disisipi);
    for (const s of bank.soal) {
      expect(pembahasan[s.kode], s.kode).toEqual(s.pembahasan);
    }
    expect(pembahasan["SISIPAN"]).toEqual({ id: "sisipan", en: "inserted" });
  });
});
