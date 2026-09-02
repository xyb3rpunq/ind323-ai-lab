<div align="center">

# IND323 AI Lab

**Pendamping kuliah dan bank soal bertimer untuk mata kuliah Kecerdasan Buatan.**
Mesin dan kunci jawabannya ditulis dalam Swift.

[**Buka situsnya**](https://xyb3rpunq.github.io/ind323-ai-lab/) ·
[Lapor masalah](https://github.com/xyb3rpunq/ind323-ai-lab/issues)

`Swift 6.2` · `Svelte 5` · `TypeScript` · `35,7 KB gzip` · `0 permintaan jaringan saat mengerjakan`

*Dibuat oleh* **`.Deckyx`**

</div>

---

## Apa ini

49 soal dari 14 sesi kuliah, dengan pewaktu, pembahasan yang muncul segera setelah dijawab, dan ringkasan materi tiap sesi. Ditambah satu hal yang membedakannya dari bank soal mana pun:

> **Kunci jawaban soal berhitung dihitung mesin, bukan diketik tangan.**

18 dari 49 soalnya berupa hitungan. Tidak satu pun menyimpan jawabannya sebagai angka tetap — yang disimpan adalah **cara menghitungnya**, dan jawabannya dihasilkan modul Swift yang sama yang diadu terhadap 3.796 pernyataan berpola bit lintas bahasa.

```swift
Soal(
    kode: "S03-01", sesi: 3, topik: "Certainty Factor",
    pertanyaan: "Diketahui MB = 0,8 dan MD = 0,01. Berapa nilai CF-nya?",
    bentuk: angka(try CertaintyFactor.dariMbMd(0.8, 0.01)),   // ← bukan 0.79
    pembahasan: "CF = MB − MD = 0,8 − 0,01 = 0,79. …")
```

Alasannya sederhana: **kunci yang diketik tangan pasti menyimpang dari algoritmanya cepat atau lambat, dan menyimpangnya tidak akan pernah terlihat.** Soalnya tetap terbaca masuk akal, dan mahasiswa yang menjawab benar justru dinyatakan salah. Kunci yang dihitung tidak bisa menyimpang tanpa menggagalkan konformansi.

Konsekuensinya disengaja: menambah soal berhitung menuntut algoritmanya sudah ada di `Sources/AIKit/Inti.swift`, bukan sekadar jawabannya diketahui penulis soal.

---

## Swift adalah implementasi kelima

Algoritma yang sama sudah ditulis empat kali di dua proyek lain: **Rust** sebagai sumber kebenaran, **Go** sebagai pembanding, **PL/SQL** di [AI ATLAS](https://github.com/xyb3rpunq/ai-atlas), dan **Lua** di [kecerdasan-buatan](https://github.com/xyb3rpunq/kecerdasan-buatan). Swift di sini ditulis **dari rumusnya, bukan diterjemahkan dari kode mana pun**, lalu diadu terhadap vektor yang sama.

```
bayes.tsv                   2187 diperiksa  BitExact                ULP maks 0  ok
certainty.tsv                680 diperiksa  BitExact                ULP maks 0  ok
fuzzy_linear.tsv             520 diperiksa  BitExact                ULP maks 0  ok
fuzzy_transcendental.tsv     222 diperiksa  NearlyEqual(4)          ULP maks 0  ok
fx.tsv                        14 diperiksa  BitExact                ULP maks 0  ok
ml_entropy.tsv                 7 diperiksa  NearlyEqual(4)          ULP maks 0  ok
ml_exact.tsv                  18 diperiksa  BitExact                ULP maks 0  ok
ml_gain.tsv                    4 diperiksa  CancellingDifference(4) ULP maks 0  ok
rng.tsv                      144 diperiksa  BitExact                ULP maks 0  ok

Seluruh 3796 pernyataan cocok antara Swift dan Rust.
```

**ULP maks nol di seluruh berkas** — termasuk yang menyentuh `exp` dan `log2`, yang menurut IEEE-754 **tidak** diwajibkan dibulatkan dengan benar dan karenanya sudah diberi kelonggaran empat ULP.

---

## Keputusan yang paling menentukan: Swift tidak berjalan di peramban

Rencana awalnya SwiftWasm. Itu dibatalkan, dan bukan karena sulit.

**Peramban tidak membutuhkannya.** Bank soalnya data statis; logika penilaiannya beberapa kilobita. Yang berharga dari Swift di sini adalah ia **menghasilkan dan menjamin** datanya — dan jaminan itu terjadi saat build. Mengirim runtime sebuah bahasa ke peramban untuk menghitung ulang konstanta yang sudah dihitung adalah kerja demi kerja itu sendiri.

Hasilnya terukur:

| | ai-atlas (Rust→WASM) | kecerdasan-buatan (Lua→WASM) | **repositori ini** |
|---|---:|---:|---:|
| Total terbitan (gzip) | 319,9 KB | 266,8 KB | **35,7 KB** |
| Runtime bahasa dikirim | 229,1 KB | 143,0 KB | **0 KB** |
| `wasm-unsafe-eval` di CSP | perlu | perlu | **tidak perlu** |

Kebijakan keamanan yang lebih sempit adalah keuntungan langsung keputusan itu, bukan kebetulan.

### Konsekuensinya: satu algoritma ditulis dua kali

Pengacakan sesi harus ada di kedua sisi — Swift menyusun sesi rujukan, peramban menyusun sesi yang dikerjakan. Dua salinan yang menyimpang akan membuat sesi berbenih sama berisi soal yang berbeda, **tanpa satu pun galat muncul**.

Karena itu keduanya diikat uji: `aikit-cli sesi <benih> 12` menuliskan sesi rujukan ke `tests/sesi-swift.txt`, dan uji sisi peramban membandingkannya baris demi baris — termasuk urutan pilihan yang diacak dan letak kuncinya setelah berpindah.

```
4 sesi diperiksa, 0 berbeda.
```

Salinan TypeScript-nya memakai `BigInt`, bukan `Number`. Lebih lambat, tetapi tepat: `Number` kehilangan ketelitian di atas 2⁵³, dan sesi ujian hanya membangkitkan puluhan angka sehingga kecepatannya tidak pernah menjadi soal.

---

## Menjalankan secara lokal

Sisi peramban tidak membutuhkan Swift sama sekali:

```bash
git clone https://github.com/xyb3rpunq/ind323-ai-lab.git
cd ind323-ai-lab
npm install
npm run dev
```

Menyentuh mesinnya membutuhkan Swift 6.2. Lewat Docker, tanpa memasang apa pun:

```bash
docker run --rm -v "$PWD":/w -w /w swift:6.2 swift test
docker run --rm -v "$PWD":/w -w /w swift:6.2 bash -c \
  'swift build && ./.build/debug/aikit-cli conform conformance/vectors'
```

### Perintah yang tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Peladen pengembangan |
| `npm run test` | 34 uji sisi peramban |
| `npm run build` | Build produksi ke `dist/` |
| `npm run budget` | Memeriksa anggaran ukuran |
| `swift test` | 68 uji mesin |
| `aikit-cli conform <dir>` | Mengadu Swift terhadap 3.796 pernyataan |
| `aikit-cli bank <berkas>` | Menuliskan bank soal beserta kunci yang dihitung |
| `aikit-cli sesi <benih> <n>` | Menuliskan sesi rujukan untuk uji kesepadanan |

---

## Cakupan pengujian

| Berkas | Fungsi publik | Uji |
|---|---:|---:|
| `Sources/AIKit/Fx.swift` | 8 | 14 |
| `Sources/AIKit/Inti.swift` | 21 | 24 |
| `Sources/AIKit/Ujian.swift` | 9 | 24 |
| `Sources/AIKit/Bank.swift` | 3 | 6 |
| `src/bank.ts` | 8 | 22 |
| `src/materi.ts` | 1 | 3 |
| **Total** | **50** | **93** |

Ditambah **3.796 pernyataan konformansi**. Angka itu bukan bagian dari 93 di atas: uji unit membuktikan Swift konsisten dengan dirinya sendiri, konformansi membuktikan ia sepakat dengan empat implementasi lain — dan hanya yang kedua yang bisa menangkap rumus yang salah tetapi konsisten.

Beberapa uji yang menahan proyek ini tetap jujur:

- **Kunci jawaban benar-benar dihitung** — beberapa kunci diperiksa ulang terhadap modul yang menghasilkannya. Kalau seseorang menggantinya dengan angka tetap, uji ini yang memberitahunya.
- **Sesi Swift dan peramban identik** — termasuk urutan pilihan dan letak kunci setelah diacak.
- **Menyisipkan soal baru tidak mengubah sesi berbenih sama** — bank diurutkan menurut kode sebelum diacak. Tanpa itu, satu soal yang disisipkan di tengah berkas akan mengubah seluruh sesi yang pernah dibagikan.
- **Posisi kunci benar-benar berpindah** — diperiksa pada 40 benih. Kalau pilihan tidak pernah teracak, yang dihafal mahasiswa adalah posisinya, bukan materinya.
- **Setiap sesi kuliah punya minimal satu soal** — bank yang bolong akan menghasilkan latihan yang diam-diam melewatkan seluruh materi satu sesi.
- **Sifat matematis, bukan hanya contoh** — posterior dan komplemennya diuji berjumlah satu pada **729 kombinasi** masukan.
- **Faktor kemudahan SM-2 punya batas bawah** — tanpa itu, soal yang berkali-kali salah akan muncul terus-menerus sampai menutupi seluruh sesi, menghukum mahasiswa alih-alih membantunya.

---

## Yang ditemukan uji

**Ekspektasi ujinya yang salah, bukan kodenya.** Satu uji menuntut `gabungBerantai(0,9; −0,5)` menghasilkan nol **negatif**. Kodenya menghasilkan nol positif, dan kodenya yang benar: rumusnya `r × max(e, 0)`, jadi tanda nolnya mengikuti tanda CF aturannya — bukan tanda buktinya. Ekspektasi itu tersalin dari kasus Rust yang `r`-nya kebetulan negatif. Vektor `certainty.tsv` sudah memuat kedua kasusnya apa adanya, dan konformansinya lolos sejak awal.

Dua jebakan bahasa yang layak dicatat:

- **`stderr` ditolak Swift 6** karena ia peubah global C yang bisa berubah, dan konteks yang diperiksa keselamatan konkurensinya menolak keadaan bersama yang tidak terlindungi. Diambil ulang lewat `fdopen(2, "w")` — nomor deskriptor yang memang ditetapkan POSIX.
- **Foundation tidak dipakai sama sekali.** Menariknya hanya untuk memangkas spasi dan membaca berkas akan membesarkan biner tanpa menambah kemampuan apa pun. Yang dibutuhkan paket ini hanya matematika dasar dan pustaka standar.

---

## Anggaran performa

Diperiksa di CI; build gagal bila terlampaui.

| Berkas | Anggaran | Terukur |
|---|---:|---:|
| JavaScript | ≤ 60 KB | **31,5 KB** |
| CSS | ≤ 20 KB | **2,2 KB** |
| HTML | ≤ 12 KB | **1,5 KB** |
| **Total** | **≤ 120 KB** | **35,7 KB** |

---

## Keputusan yang disengaja

**Pewaktu per sesi, bukan per soal.** Pewaktu per soal memaksa ritme seragam, padahal soal berhitung memang butuh lebih lama daripada soal ingatan. Pembagian waktu itu sendiri bagian dari yang diuji ujian sungguhan.

**Pembahasan muncul segera setelah dijawab, bukan di akhir sesi.** Jarak antara menjawab dan mengetahui benar-salahnya menentukan seberapa banyak yang melekat; menundanya sampai akhir mengubah latihan menjadi sekadar pengukuran.

**Ketepatan per topik diurutkan menurut nilainya, bukan menurut nama.** Bagian yang paling perlu diulang harus muncul lebih dulu, bukan tenggelam di tengah daftar.

**Soal berangka dinilai dengan toleransi, bukan kesamaan persis.** Mahasiswa yang menulis 0,79 untuk jawaban 0,7900000000000001 tidak sedang keliru.

**Soal yang dilewati dinilai salah, bukan dikeluarkan dari hitungan.** Soal yang tidak dijawab tetap soal yang tidak dikuasai, dan nilai yang menyembunyikannya tidak berguna bagi siapa pun.

**Ringkasan materi bukan salinan modul.** Yang ditulis hanya tiga hal yang tidak ada di slide mana pun: satu gagasan pokok, hal yang paling sering keliru dipahami, dan apa yang sebenarnya diuji. Menyalin definisi akan menghasilkan salinan kedua yang menyimpang dari aslinya.

---

## Struktur direktori

```
ind323-ai-lab/
├── Sources/
│   ├── AIKit/
│   │   ├── Fx.swift        Pertukaran pecahan bit-eksak, ULP, keterbandingan
│   │   ├── Inti.swift      SplitMix64, CF, Bayes, kabur, entropi, jarak
│   │   ├── Ujian.swift     Penyusun sesi, penilaian, ringkasan, SM-2
│   │   └── Bank.swift      49 soal; kunci berhitungnya dihasilkan Inti
│   └── aikit-cli/          conform · bank · sesi
├── Tests/AIKitTests/       68 uji
├── conformance/vectors/    2.266 vektor berpola bit dari AI ATLAS
├── src/
│   ├── generated/bank.json Dihasilkan Swift; dijaga CI agar tetap mutakhir
│   ├── bank.ts             Salinan pengacak dan penilai, diikat uji ke Swift
│   ├── materi.ts           Ringkasan 14 sesi kuliah
│   ├── lib/Ujian.svelte    Sesi bertimer
│   └── App.svelte          Kerangka dan perutean
├── tests/
│   ├── bank.test.ts        34 uji
│   └── sesi-swift.txt      Sesi rujukan dari Swift, untuk uji kesepadanan
└── .github/workflows/      Uji, adu, hasilkan, terbitkan
```

---

## Sumber materi

Modul kuliah **IND323 Kecerdasan Buatan**, Universitas Esa Unggul, oleh Dr. Ir. Zulfiandri M.Si., dengan dosen pengampu Ari Pambudi. Soal disusun dari materi tersebut; dua di antaranya diambil langsung dari lembar tugas — Tugas Sesi 3 (CF cacar) dan Tugas Pertemuan 5 (deteksi hoaks).

## Lisensi

[MIT](LICENSE) — bebas dipakai, disalin, dan diubah. Cantumkan `.Deckyx` bila berkenan.

<div align="center">

**`.Deckyx`** — Daniel Hutajulu

</div>
