<div align="center">

# IND323 AI Lab

**Pendamping kuliah dan bank soal bertimer untuk mata kuliah Kecerdasan Buatan.**
Mesin dan kunci jawabannya ditulis dalam Swift.

[**Buka situsnya**](https://xyb3rpunq.github.io/ind323-ai-lab/) ·
[Lapor masalah](https://github.com/xyb3rpunq/ind323-ai-lab/issues)

`Swift 6.2` · `Svelte 5` · `TypeScript` · `44 KB gzip` · `0 permintaan jaringan saat mengerjakan`

*Dibuat oleh* **`.Deckyx`**

[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia) · [🇬🇧 English](#-english)

</div>

---

## 🇮🇩 Bahasa Indonesia

### Ini apa, sih?

Ini seperti buku latihan soal — tapi yang memeriksa jawabannya bukan orang.

Kalau sebuah soal bertanya "berapa hasilnya?", jawaban yang benar **tidak
diketik siapa pun**. Ia dihitung ulang oleh program setiap kali situsnya
dibangun. Kenapa begitu penting? Karena kunci jawaban yang diketik tangan pasti
salah suatu hari — dan yang rugi adalah mahasiswa yang jawabannya benar tapi
dinyatakan salah.

Ada juga **mode Ajar**: 71 salindia siap diproyeksikan di kelas, lengkap dengan
catatan untuk pengajar yang tidak ikut terlihat di layar proyektor.

Semuanya berjalan di peramban. Tidak ada data yang dikirim ke mana pun.

### Yang baru

| Modul | Yang diperlihatkan |
|---|---|
| **Mode Ajar** | 71 salindia dari materi yang sudah ada. Panah untuk berpindah, `F` layar penuh, `N` catatan pengajar, `D` daftar sesi. Nomor salindia masuk ke alamat — proyektor mati di tengah kuliah tidak berarti kehilangan tempat. |
| **Peta cakupan bank soal** | 14 sesi × 3 tingkat kesulitan. Daftar angka menjawab "berapa banyak"; peta ini menjawab "yang mana", dan lubangnya langsung terlihat. |
| **Kurva penjadwalan SM-2** | Kapan sebuah soal kembali muncul, dengan sumbu logaritmik karena jaraknya bergerak dari satu hari ke belasan ribu. Geser kendalinya untuk melihat harga satu kesalahan. |
| **Ketepatan per topik** | Sebagai gambar, dengan jumlah soal di tiap ujung dan garis ambang 80%. Bilah tanpa jumlah menyembunyikan bahwa 1/1 dan 8/10 adalah dua hal yang sangat berbeda. |

Algoritma SM-2 kini ada dua kali: **Swift sebagai sumber kebenaran**,
TypeScript supaya kurvanya bisa digambar di peramban. Perintah
`aikit-cli jadwal` menghasilkan jejaknya, dan uji mengadu keduanya pola bit
demi pola bit termasuk faktor kemudahannya. Kurva yang digambar dari salinan
yang menyimpang akan mengajarkan algoritma yang bukan algoritma situs ini.

## Apa ini

49 soal dari 14 sesi kuliah, dengan pewaktu, pembahasan yang muncul segera setelah dijawab, dan ringkasan materi tiap sesi. Ditambah satu hal yang membedakannya dari bank soal mana pun:

> **Kunci jawaban soal berhitung dihitung mesin, bukan diketik tangan.**

18 dari 49 soalnya berupa hitungan. Tidak satu pun menyimpan jawabannya sebagai angka tetap — yang disimpan adalah **cara menghitungnya**, dan jawabannya dihasilkan modul Swift yang sama yang diadu terhadap 3.796 pernyataan berpola bit lintas bahasa.

```swift
Soal(
    kode: "S03-01", sesi: 3, topik: "Certainty Factor",
    pertanyaan: bi("Diketahui MB = 0,8 dan MD = 0,01. Berapa nilai CF-nya?",
                   "Given MB = 0.8 and MD = 0.01, what is the CF?"),
    bentuk: angka(try CertaintyFactor.dariMbMd(0.8, 0.01)),   // ← bukan 0.79
    pembahasan: bi("CF = MB − MD = 0,8 − 0,01 = 0,79. …",
                   "CF = MB − MD = 0.8 − 0.01 = 0.79. …"))
```

Alasannya sederhana: **kunci yang diketik tangan pasti menyimpang dari algoritmanya cepat atau lambat, dan menyimpangnya tidak akan pernah terlihat.** Soalnya tetap terbaca masuk akal, dan mahasiswa yang menjawab benar justru dinyatakan salah. Kunci yang dihitung tidak bisa menyimpang tanpa menggagalkan konformansi.

Konsekuensinya disengaja: menambah soal berhitung menuntut algoritmanya sudah ada di `Sources/AIKit/Inti.swift`, bukan sekadar jawabannya diketahui penulis soal.

---

## Dwibahasa sampai ke dalam bank soalnya

Seluruh 49 soal, pilihan, dan pembahasannya ada dalam Bahasa Indonesia dan Bahasa Inggris — bukan hanya antarmukanya. Keduanya ditulis **di baris yang sama**, sebagai pasangan:

```swift
public struct Dwibahasa: Hashable, Sendable { public let id, en: String }
public func bi(_ id: String, _ en: String) -> Dwibahasa { Dwibahasa(id, en) }
```

Bentuk pasangan dipilih dengan sengaja, bukan kamus berkunci. Kamus berkunci selalu berakhir sama: yang satu diperbaiki, yang lain tertinggal — dan yang tertinggal hampir selalu bahasa yang tidak dipakai penulisnya sehari-hari, sehingga penulisnya sendiri tidak akan pernah melihatnya. Di sini terjemahan yang hilang menjadi **galat kompilasi**, bukan soal yang tampil kosong di tengah ujian.

Tiga hal yang sengaja **tidak** ikut berganti bahasa:

- **`kode` dan `topik`** — keduanya kunci, bukan teks yang dibaca. `topik` dipakai mengelompokkan ketepatan, dan kunci yang ikut berganti bahasa menghasilkan dua ringkasan yang tidak bisa dibandingkan satu sama lain. Nama topik yang dibaca manusia ada di `NAMA_TOPIK` sisi antarmuka.
- **Indeks jawaban benar** — kuncinya menunjuk posisi, bukan teks. Menerjemahkan pilihan tidak bisa menggesernya.
- **Komentar kode** — pembacanya pengembang, bukan pengunjung.

Dan satu pasangan yang tidak akan pernah ketahuan dengan membaca kode: **"Benar/Salah" pada tombol pernyataan berarti True/False, sedangkan "Benar/Salah" pada lencana hasil berarti Correct/Incorrect.** Dalam Bahasa Indonesia keduanya kebetulan memakai kata yang sama. Satu entri kamus untuk keduanya akan menawarkan tombol "Correct" sebagai jawaban atas pernyataan yang belum dijawab siapa pun.

### Yang menjaganya tetap begitu

Uji di `uji-web/dwibahasa.test.ts` **membaca markupnya sendiri** dan menolak teks yang tidak lewat kamus: simpul teks yang ditulis langsung, untai di dalam ekspresi yang tampil, dan atribut yang dibaca manusia (`placeholder`, `title`, `alt`, `aria-label`). Saat pertama dijalankan ia menemukan 20 bocoran yang lolos seluruh uji sebelumnya — judul kolom peta cakupan, kunci topik yang tampil mentah di layar ujian, tuts "spasi", dan seluruh tombol layar ujian.

Kegagalan seperti itu tidak bisa dilihat dari dalam kamus, karena teks yang bocor memang bukan bagian darinya.

---

## Pembahasan diunduh terpisah

Pembahasan 49 soal dalam dua bahasa berukuran **8,1 KB terkompresi dari 14,1 KB seluruh bank** — lebih dari separuhnya, dan seluruhnya teks yang tidak dibaca siapa pun sebelum satu soal pun dijawab.

Jadi ia potongan tersendiri. `scripts/pisah-bank.mjs` menurunkan dua berkas dari `bank.json`: `bank-inti.json` yang dimuat di muka, dan `bank-pembahasan.json` yang diunduh saat sesi dimulai — sesudah tombol ditekan, sebelum layar ujian tampil. Berkas utama turun dari 58,3 KB menjadi **52,2 KB**.

Pemisahannya **diturunkan**, bukan dihasilkan Swift, supaya Swift tetap menulis satu berkas yang dibandingkan CI. Turunan seperti itu justru bisa diperiksa jauh lebih kuat daripada apa pun yang bisa dilakukan Swift:

> Menyatukan kembali hasil pemisahan harus menghasilkan bank yang **sama persis** dengan yang masuk.

Itu yang diuji, dan ia tidak mungkin lolos sementara satu pembahasan hilang, tertukar, atau tergeser.

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

Karena itu keduanya diikat uji: `aikit-cli sesi <benih> 12` menuliskan sesi rujukan ke `uji-web/sesi-swift.txt`, dan uji sisi peramban membandingkannya baris demi baris — termasuk urutan pilihan yang diacak dan letak kuncinya setelah berpindah.

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
| `npm run test` | 58 uji sisi peramban |
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
| `Sources/AIKit/Ujian.swift` | 10 | 26 |
| `Sources/AIKit/Bank.swift` | 3 | 6 |
| `src/bank.ts` | 9 | 34 |
| `src/pembahasan.ts` | 3 | 7 |
| `src/materi.ts` | 1 | 5 |
| `src/jadwal.ts` | 3 | 9 |
| `src/ekspor.ts` | 5 | 13 |
| `src/i18n.ts` + markup | — | 9 |
| `scripts/pisah-bank.mjs` | 3 | 5 |
| **Total** | **66** | **147** |

Ditambah **3.796 pernyataan konformansi**. Angka itu bukan bagian dari 147 di atas: uji unit membuktikan Swift konsisten dengan dirinya sendiri, konformansi membuktikan ia sepakat dengan empat implementasi lain — dan hanya yang kedua yang bisa menangkap rumus yang salah tetapi konsisten.

Beberapa uji yang menahan proyek ini tetap jujur:

- **Rapor mencatat bahasanya sendiri** — rapor yang beredar lepas dari
  halamannya tetap bisa ditelusuri asalnya, termasuk bahasa mana yang dipakai
  saat ia dibuat.
- **Penilaian dicocokkan lewat kode, bukan urutan** — sesi yang ditinggalkan di
  tengah menghasilkan penilaian yang lebih pendek daripada soalnya, dan
  mencocokkan berdasar indeks akan menggeser seluruh baris sesudahnya tanpa
  satu pun galat muncul.

- **Kunci jawaban benar-benar dihitung** — beberapa kunci diperiksa ulang terhadap modul yang menghasilkannya. Kalau seseorang menggantinya dengan angka tetap, uji ini yang memberitahunya.
- **Sesi Swift dan peramban identik** — termasuk urutan pilihan dan letak kunci setelah diacak.
- **Menyisipkan soal baru tidak mengubah sesi berbenih sama** — bank diurutkan menurut kode sebelum diacak. Tanpa itu, satu soal yang disisipkan di tengah berkas akan mengubah seluruh sesi yang pernah dibagikan.
- **Posisi kunci benar-benar berpindah** — diperiksa pada 40 benih. Kalau pilihan tidak pernah teracak, yang dihafal mahasiswa adalah posisinya, bukan materinya.
- **Setiap sesi kuliah punya minimal satu soal** — bank yang bolong akan menghasilkan latihan yang diam-diam melewatkan seluruh materi satu sesi.
- **Sifat matematis, bukan hanya contoh** — posterior dan komplemennya diuji berjumlah satu pada **729 kombinasi** masukan.
- **Faktor kemudahan SM-2 punya batas bawah** — tanpa itu, soal yang berkali-kali salah akan muncul terus-menerus sampai menutupi seluruh sesi, menghukum mahasiswa alih-alih membantunya.
- **Prosa tiap soal benar-benar diterjemahkan, bukan disalin** — menyalin kolom Indonesia ke kolom Inggris lolos setiap pemeriksaan panjang, dan menghasilkan bank yang mengaku dwibahasa padahal menampilkan satu bahasa dua kali.
- **Pilihan kembar diperiksa per bahasa** — dua pilihan yang berbeda dalam Bahasa Indonesia tetapi jatuh pada kalimat Inggris yang sama adalah soal dengan dua jawaban identik bagi yang membacanya dalam Bahasa Inggris.
- **Judul tab diterapkan di fungsi yang sama dengan atribut `lang`** — judul tab tidak terlihat di halaman, jadi ia satu-satunya teks yang bisa tertinggal berbulan-bulan tanpa ada yang menyadarinya. Yang menjaganya bukan ingatan, melainkan letaknya.

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
| JavaScript (di muka) | ≤ 60 KB | **52,2 KB** |
| JavaScript (pembahasan, saat sesi dimulai) | ≤ 60 KB | **8,1 KB** |
| CSS | ≤ 20 KB | **3,6 KB** |
| HTML | ≤ 12 KB | **1,5 KB** |
| **Total** | **≤ 120 KB** | **65,9 KB** |

Angkanya naik dibanding versi satu bahasa, dan memang harus: bank dwibahasa memuat dua kali teks. Yang dijaga bukan totalnya, melainkan **apa yang diunduh sebelum halaman bisa dipakai** — dan pembahasan tidak termasuk di dalamnya.

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
├── Tests/AIKitTests/       70 uji Swift
├── conformance/vectors/    2.266 vektor berpola bit dari AI ATLAS
├── src/
│   ├── generated/
│   │   ├── bank.json       Dihasilkan Swift; dijaga CI agar tetap mutakhir
│   │   ├── bank-inti.json  Turunan tanpa pembahasan; dimuat di muka
│   │   └── bank-pembahasan.json  Turunan; diunduh saat sesi dimulai
│   ├── bank.ts             Salinan pengacak dan penilai, diikat uji ke Swift
│   ├── pembahasan.ts       Pemuat pembahasan, sekali saja
│   ├── i18n.ts             Kamus dwibahasa; pasangan, bukan kamus berkunci
│   ├── materi.ts           Ringkasan 14 sesi kuliah
│   ├── lib/Ujian.svelte    Sesi bertimer
│   └── App.svelte          Kerangka dan perutean
├── uji-web/                Dinamai begini, bukan `tests/`: pada filesystem
│   │                       Windows yang tidak peka huruf besar-kecil, `tests/`
│   │                       bertabrakan dengan `Tests/` milik Swift dan salah
│   │                       satunya hilang tanpa peringatan.
│   ├── bank.test.ts        41 uji sisi peramban
│   ├── dwibahasa.test.ts   Menolak teks yang tidak lewat kamus
│   ├── pisah-bank.test.ts  Menyatukan kembali harus sama persis
│   └── sesi-swift.txt      Sesi rujukan dari Swift, untuk uji kesepadanan
├── scripts/pisah-bank.mjs  Menurunkan dua berkas dari bank.json
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

---

## 🇬🇧 English

### What is this?

Think of it as a practice workbook — except the answers are not checked by a
person.

When a question asks "what is the result?", the correct answer is **not typed
by anyone**. It is recomputed by a program every time the site is built. Why
does that matter? Because a hand-typed answer key will be wrong one day — and
the person who pays for it is the student whose correct answer is marked wrong.

There is also a **Teach mode**: 71 slides ready to project in class, complete
with presenter notes that never appear on the projector.

Everything runs in the browser. No data leaves your machine.

### Answer keys are computed, not typed

49 questions across 14 course sessions, with a timer, an explanation that
appears immediately after answering, and a summary of each session's material.
18 of the 49 are calculations. Not one stores its answer as a fixed number —
what is stored is **how to compute it**, and the answer is produced by the same
Swift module that is checked against 3,796 cross-language bit-pattern
assertions.

```swift
Soal(
    kode: "S03-01", sesi: 3, topik: "Certainty Factor",
    pertanyaan: bi("Diketahui MB = 0,8 dan MD = 0,01. Berapa nilai CF-nya?",
                   "Given MB = 0.8 and MD = 0.01, what is the CF?"),
    bentuk: angka(try CertaintyFactor.dariMbMd(0.8, 0.01)),   // ← not 0.79
    pembahasan: bi("CF = MB − MD = 0,8 − 0,01 = 0,79. …",
                   "CF = MB − MD = 0.8 − 0.01 = 0.79. …"))
```

A hand-typed key is certain to drift from its algorithm sooner or later, and
the drift is invisible: the question still reads sensibly, and the student who
answers correctly is told they are wrong. A computed key cannot drift without
failing conformance.

### Bilingual all the way into the question bank

All 49 questions, every option, and every explanation exist in Indonesian and
English — not just the interface. Both are written **on the same line**, as a
pair, so neither can be edited without seeing the other:

```swift
public struct Dwibahasa: Hashable, Sendable { public let id, en: String }
public func bi(_ id: String, _ en: String) -> Dwibahasa { Dwibahasa(id, en) }
```

Pairs rather than a keyed dictionary, deliberately. A keyed dictionary always
ends the same way: one side is fixed, the other is left behind — and the side
left behind is almost always the language the author does not speak daily, so
the author never sees it. Here a missing translation is a **compile error**,
not a question that renders blank in the middle of an exam.

Three things deliberately do **not** switch language: `kode` and `topik` (both
are keys, and a grouping key that changes language produces two summaries that
cannot be compared), the correct-answer index (it points at a position, not at
text), and code comments (their readers are developers, not visitors).

And one pair that no amount of code reading would reveal: **"Benar/Salah" on a
statement button means True/False, while "Benar/Salah" on the result badge
means Correct/Incorrect.** In Indonesian both happen to use the same word. One
dictionary entry for both would offer a button labelled "Correct" as an answer
to a statement nobody has answered yet.

The test in `uji-web/dwibahasa.test.ts` **reads the markup itself** and rejects
text that does not pass through the dictionary: literal text nodes, string
literals inside rendered expressions, and human-readable attributes
(`placeholder`, `title`, `alt`, `aria-label`). On its first run it found 20
leaks that every earlier test had passed over.

### Explanations are downloaded separately

The explanations for 49 questions in two languages are **8.1 KB gzipped out of
the bank's 14.1 KB** — more than half of it, and none of it is read by anyone
before a single question has been answered.

So they are a chunk of their own. `scripts/pisah-bank.mjs` derives two files
from `bank.json`: `bank-inti.json`, loaded up front, and
`bank-pembahasan.json`, fetched when a session starts — after the button is
pressed, before the exam screen appears. The main bundle went from 58.3 KB to
**52.2 KB**.

The split is *derived* rather than emitted by Swift, so that Swift keeps
writing the single file CI compares. And a derived split can be checked far
more strongly than anything Swift could do: putting the two halves back
together must produce a bank **identical** to the one that went in. That is
what the test asserts, and it cannot pass while one explanation is missing,
swapped, or shifted.

### What is new

| Module | What it shows |
|---|---|
| **Teach mode** | 71 slides generated from the existing material. Arrow keys to move, `F` for fullscreen, `N` for presenter notes, `D` for the session index. The slide number lives in the URL — a projector dying mid-lecture no longer means losing your place. |
| **Question-bank coverage map** | 14 sessions × 3 difficulty levels. A list of counts answers "how many"; this map answers "which", and the gaps are immediately visible. |
| **SM-2 scheduling curve** | When a question comes back, on a logarithmic axis because the interval moves from one day to tens of thousands. Drag the controls to see the cost of a single mistake. |
| **Per-topic accuracy** | As a figure, with question counts at each end and an 80% threshold line. A bar without counts hides that 1/1 and 8/10 are very different things. |

SM-2 now exists twice: **Swift as the source of truth**, TypeScript so the
curve can be drawn in the browser. `aikit-cli jadwal` emits the trace, and a
test compares the two bit pattern by bit pattern, including the easiness
factor. A curve drawn from a drifting copy would teach an algorithm that is not
this site's algorithm.

### Why Swift, and why not SwiftWasm

Swift is the **fifth** independent implementation of this project's core
algorithms, after Rust, Go, Oracle PL/SQL, and Lua. All 3,796 assertions match
with a maximum error of 0 ULP.

SwiftWasm was deliberately rejected. The browser does not need a Swift runtime
to display static data: Swift runs at **build time** as the question-bank
generator and the conformance gate. The result is 60.3 KB gzip of JavaScript —
52.2 KB up front plus 8.1 KB of explanations on demand — rather than several
megabytes, and a Content Security Policy with no `wasm-unsafe-eval`.

### Running it

```bash
npm install
npm run dev        # http://localhost:5175/ind323-ai-lab/
npm run audit:all  # typecheck, tests, build, budget

# The Swift side, if you have Swift 6.2 (or Docker):
swift test
swift run aikit-cli conform conformance/vectors
swift run aikit-cli bank src/generated/bank.json
swift run aikit-cli jadwal > uji-web/jadwal-swift.txt
```

70 Swift tests and 77 browser-side tests, plus 3,796 conformance assertions.
CI additionally verifies that the committed question bank is byte-identical to
what Swift generates, and that both derived files are still in step with it. If it differs, an answer key changed without anyone
noticing — and a page that tells a student they are wrong when they are right
is a worse failure than a red build.

---

<div align="center">

**Bagian dari empat situs IND323** · *Part of the four IND323 sites*

[ai-atlas](https://xyb3rpunq.github.io/ai-atlas/) (Rust → WASM) ·
[kecerdasan-buatan](https://xyb3rpunq.github.io/kecerdasan-buatan/) (Lua) ·
**ind323-ai-lab** (Swift) ·
[neuronusa](https://xyb3rpunq.github.io/neuronusa/) (Brython)

</div>
