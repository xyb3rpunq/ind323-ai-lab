/**
 * Ringkasan materi tiap sesi kuliah.
 *
 * Bukan salinan modul. Yang ditulis di sini adalah tiga hal yang tidak ada di
 * slide mana pun: satu gagasan pokok yang kalau itu saja dipahami sisanya
 * menyusul, hal yang paling sering keliru dipahami, dan apa yang sebenarnya
 * ditanyakan saat ujian.
 *
 * Modulnya sendiri sudah memuat definisinya. Menyalin definisi ke sini hanya
 * akan menghasilkan salinan kedua yang menyimpang dari aslinya, dan mahasiswa
 * yang membaca keduanya justru bingung mana yang benar.
 *
 * .Deckyx
 */

export interface Rumus {
  nama: string;
  ekspresi: string;
}

export interface Materi {
  sesi: number;
  judul: string;
  /** Gagasan pokok sesi ini, satu paragraf. */
  inti: string;
  /** Kekeliruan yang paling sering muncul. */
  keliru: string;
  /** Bentuk pertanyaan yang biasanya keluar. */
  diuji: string;
  rumus: Rumus[];
}

export const MATERI: Materi[] = [
  {
    sesi: 1,
    judul: "Pengantar Kecerdasan Buatan",
    inti: "Turing mengganti pertanyaan “apakah mesin bisa berpikir” — yang tidak bisa diuji — dengan pertanyaan yang bisa: apakah penanya bisa membedakannya. ELIZA lalu menunjukkan betapa tipis ambang itu: seratus baris aturan pencocokan kata kunci sudah cukup membuat orang merasa dipahami.",
    keliru: "Menganggap ELIZA punya pemahaman sekecil apa pun. Ia hanya mencocokkan kata kunci lalu memantulkan potongan kalimat dengan kata ganti ditukar. Yang menarik justru kesenjangannya: mesin yang sesederhana itu menghasilkan kesan yang sekuat itu, dan kesan itu datang dari manusia yang menilai, bukan dari mesinnya.",
    diuji: "Definisi uji Turing dan apa yang bukan bagian darinya, cara kerja ELIZA, dan istilah “efek ELIZA”. Hampir selalu berupa pilihan ganda atau benar-salah, jarang berhitung.",
    rumus: [],
  },
  {
    sesi: 2,
    judul: "Agen Cerdas dan Ruang Keadaan",
    inti: "Yang membedakan keempat jenis agen bukan kecanggihan melainkan seberapa banyak yang mereka ingat. Agen refleks sederhana tidak punya cara mengetahui bahwa pekerjaannya sudah selesai, jadi ia terus bergerak sampai dihentikan paksa — dan itulah sebabnya biayanya hampir selalu paling besar meski aturannya tidak salah.",
    keliru: "Mengira PEAS hanya daftar istilah yang perlu dihafal. Ukuran keberhasilan diletakkan pertama karena ia yang menentukan sisanya: agen yang dinilai dari kebersihan berperilaku sama sekali berbeda dari agen yang dinilai dari hemat energi, meski lingkungan dan sensornya sama persis.",
    diuji: "Membedakan keempat jenis agen, menguraikan PEAS sebuah masalah, dan keterjangkauan pada masalah teko air. Yang terakhir sering dikira harus dicoba satu per satu, padahal teorema Bézout menjawabnya seketika.",
    rumus: [
      { nama: "Keterjangkauan teko air", ekspresi: "sasaran dapat dicapai ⟺ sasaran kelipatan FPB(a, b)" },
    ],
  },
  {
    sesi: 3,
    judul: "Ketidakpastian dan Certainty Factor",
    inti: "MYCIN lahir dari masalah nyata: dokter tidak pernah berkata “pasti”. CF mengubah “kemungkinan besar” menjadi satu angka antara −1 dan +1, lalu menyediakan cara menggabungkan beberapa angka seperti itu tanpa perlu tahu peluang sebenarnya — yang justru hampir tidak pernah tersedia.",
    keliru: "Menganggap CF sebagai probabilitas. CF sebuah hipotesis dan ingkarannya tidak harus berjumlah satu, jadi menjumlahkannya seperti peluang menghasilkan angka yang tidak berarti apa-apa. Kekeliruan kedua: memakai rumus penggabungan tanpa memeriksa tanda kedua CF lebih dulu — ada tiga cabang, dan yang menentukan cabangnya adalah tandanya.",
    diuji: "Menghitung CF dari MB dan MD, menggabungkan dua sampai tiga bukti, dan menentukan CF kesimpulan dari CF aturan. Yang sering menjebak: bukti ber-CF negatif pada penggabungan berantai menghasilkan nol, bukan nilai negatif.",
    rumus: [
      { nama: "CF dari MB dan MD", ekspresi: "CF = MB − MD" },
      { nama: "Dua CF positif", ekspresi: "CF₁ + CF₂ × (1 − CF₁)" },
      { nama: "Dua CF negatif", ekspresi: "CF₁ + CF₂ × (1 + CF₁)" },
      { nama: "Tanda berlawanan", ekspresi: "(CF₁ + CF₂) / (1 − min(|CF₁|, |CF₂|))" },
      { nama: "Berantai", ekspresi: "CF_aturan × max(CF_premis, 0)" },
    ],
  },
  {
    sesi: 4,
    judul: "Probabilitas Bayesian",
    inti: "Teorema Bayes membalik arah pertanyaan: dari “seberapa sering gejala muncul pada yang sakit” menjadi “seberapa mungkin sakit bila gejalanya muncul”. Pembalikan itu tampak sepele di rumus tetapi hampir selalu keliru di kepala, karena orang melupakan seberapa jarang penyakitnya sendiri.",
    keliru: "Menukar P(E|H) dengan P(H|E) — kekeliruan paling umum di seluruh statistika terapan. Yang kedua: mengira P(E|¬H) sama dengan 1 − P(E|H). Keduanya tentang kelompok yang berbeda dan harus diketahui terpisah.",
    diuji: "Menghitung posterior dari prior dan dua likelihood. Hampir selalu disertai jebakan laju dasar: prior yang sangat kecil membuat posterior tetap kecil meski tesnya sangat akurat. Periksa jawaban Anda dengan menghitung P(E) lebih dulu — kalau posterior lebih besar daripada P(E|H), pasti ada yang salah.",
    rumus: [
      { nama: "Teorema Bayes", ekspresi: "P(H|E) = P(E|H) × P(H) / P(E)" },
      { nama: "Peluang bukti", ekspresi: "P(E) = P(E|H)·P(H) + P(E|¬H)·P(¬H)" },
      { nama: "Rasio kemungkinan", ekspresi: "LR = P(E|H) / P(E|¬H)" },
    ],
  },
  {
    sesi: 5,
    judul: "Logika Fuzzy I — Himpunan dan Keanggotaan",
    inti: "Zadeh mengusulkan mengganti benar-salah dengan derajat keanggotaan karena begitulah manusia menggambarkan dunia. Suhu 29 derajat tidak “panas” atau “tidak panas”; ia panas sebesar 0,4 dan hangat sebesar 0,6 sekaligus, dan justru tumpang tindih itulah yang membuat sistemnya berperilaku halus.",
    keliru: "Menganggap derajat keanggotaan sebagai peluang dan mengira jumlahnya harus satu. Kekeliruan yang lebih halus: menulis himpunan di tepi semesta sebagai segitiga biasa. Himpunan tepi harus berkaki berimpit — (0, 0, 15), bukan (0, 7, 15) — kalau tidak ia bernilai nol tepat di tempat seharusnya bernilai satu.",
    diuji: "Menghitung derajat keanggotaan sebuah nilai pada himpunan segitiga atau trapesium. Perhatikan di kaki mana nilainya jatuh sebelum memilih rumusnya, dan periksa apakah kakinya berimpit.",
    rumus: [
      { nama: "Segitiga", ekspresi: "0 | (x−a)/(b−a) | (c−x)/(c−b) | 0" },
      { nama: "Trapesium", ekspresi: "0 | (x−a)/(b−a) | 1 | (d−x)/(d−c) | 0" },
    ],
  },
  {
    sesi: 6,
    judul: "Logika Fuzzy II — Inferensi dan Penegasan",
    inti: "Aturan hanya menentukan kekuatan penyalaan; yang membedakan Mamdani, Sugeno, dan Tsukamoto adalah cara mengubah kekuatan itu menjadi satu angka. Karena itu aturan yang sama persis memberi tiga jawaban berbeda — dan itu bukan kesalahan melainkan konsekuensi definisi masing-masing.",
    keliru: "Mengira titik berat sama dengan rata-rata puncak aturan. Keduanya sering memberi hasil mirip pada contoh yang setangkup, dan kemiripan itu menyembunyikan perbedaannya sampai muncul soal yang tidak setangkup. Kekeliruan kedua: membiarkan ada masukan yang tidak tertutup satu aturan pun.",
    diuji: "Menghitung kekuatan penyalaan tiap aturan, lalu menegaskannya dengan salah satu metode. Yang paling sering keluar adalah Sugeno, karena hitungannya paling pendek dan tetap menguji seluruh rantainya.",
    rumus: [
      { nama: "Kekuatan aturan", ekspresi: "α = min(μ₁, μ₂, …) untuk DAN, max untuk ATAU" },
      { nama: "Titik berat (Mamdani)", ekspresi: "z* = Σ(x·μ(x)) / Σμ(x)" },
      { nama: "Rata-rata berbobot (Sugeno)", ekspresi: "z* = Σ(αᵢ·zᵢ) / Σαᵢ" },
    ],
  },
  {
    sesi: 7,
    judul: "Representasi Pengetahuan",
    inti: "Tabel kebenaran menjawab “apakah benar” dengan mencoba seluruh kemungkinan — jujur, tetapi barisnya berlipat dua tiap proposisi ditambahkan. Resolusi menjawab pertanyaan yang sama dengan membuktikan: menyangkal kesimpulan lalu mencari kontradiksi, tanpa perlu menyentuh sebagian besar kemungkinan.",
    keliru: "Mengira resolusi mencari bukti langsung. Ia justru menambahkan ingkaran kesimpulan ke basis pengetahuan lalu mencari klausa kosong; kalau klausa kosong muncul, ingkarannya mustahil benar. Pada jaringan semantik, kekeliruan yang lazim adalah menuliskan ulang sifat yang sudah diwarisi dari induknya.",
    diuji: "Menyusun tabel kebenaran, menentukan tautologi atau kontradiksi, dan menelusuri satu pembuktian resolusi. Menghitung jumlah baris untuk n proposisi hampir selalu muncul sebagai soal pemanasan.",
    rumus: [
      { nama: "Jumlah baris tabel kebenaran", ekspresi: "2ⁿ untuk n proposisi" },
    ],
  },
  {
    sesi: 8,
    judul: "Teknik Pencarian dan Heuristik",
    inti: "Yang membedakan algoritma pencarian bukan apakah mereka menemukan jalan, melainkan berapa banyak simpul yang harus diperiksa untuk itu. Heuristik yang baik memangkas pemeriksaan tanpa mengorbankan jaminan — dan syaratnya satu: ia tidak boleh menaksir lebih besar daripada biaya sebenarnya.",
    keliru: "Mengira heuristik yang lebih besar lebih baik karena membuat pencarian lebih cepat. Ia memang lebih cepat, tetapi berhenti menjamin jalur terpendek. Kekeliruan kedua: mengira DFS menemukan jalur terpendek karena ia sampai lebih dulu pada contoh tertentu.",
    diuji: "Menelusuri BFS, DFS, atau A* langkah demi langkah pada graf kecil, dan menjelaskan syarat admissible. Jarak Manhattan sebagai heuristik peta berpetak hampir selalu muncul.",
    rumus: [
      { nama: "Fungsi evaluasi A*", ekspresi: "f(n) = g(n) + h(n)" },
      { nama: "Jarak Manhattan", ekspresi: "d = |x₁−x₂| + |y₁−y₂|" },
    ],
  },
  {
    sesi: 9,
    judul: "Jaringan Syaraf Tiruan",
    inti: "Perceptron satu lapis hanya bisa menarik satu garis lurus, dan temuan Minsky–Papert bahwa XOR tidak terpisahkan secara linear menghentikan penelitian bidang ini hampir dua dekade. Perambatan balik memecahkannya dengan menambah lapisan tersembunyi, sehingga batas keputusannya boleh melengkung.",
    keliru: "Menyetel laju belajar sebesar-besarnya agar pelatihannya cepat. Langkah yang terlalu besar melewati titik terendah lalu memantul ke sisi seberang; cirinya khas — kurva galatnya berayun dan tidak pernah mengecil, berbeda dari laju terlalu kecil yang menurun tetapi lambat.",
    diuji: "Menghitung keluaran satu neuron dari bobot dan masukannya, menerapkan fungsi aktivasi, dan menjelaskan kenapa XOR memerlukan lapisan tersembunyi.",
    rumus: [
      { nama: "Keluaran neuron", ekspresi: "y = f(Σ wᵢxᵢ + b)" },
      { nama: "Sigmoid", ekspresi: "σ(x) = 1 / (1 + e⁻ˣ)" },
      { nama: "Pembaruan bobot", ekspresi: "wᵢ ← wᵢ + η · δ · xᵢ" },
    ],
  },
  {
    sesi: 10,
    judul: "Pemrosesan Bahasa Alami",
    inti: "Pencari kata dasar Bahasa Indonesia tidak bisa meminjam algoritma Bahasa Inggris, karena sebagian awalan kita meluluhkan huruf pertama kata dasarnya: “menyapu” berasal dari “sapu”, bukan “nyapu”. Aturan pengupasan saja tidak cukup — ia harus disertai pemeriksaan kamus.",
    keliru: "Mengira pengupasan imbuhan bisa dijalankan sampai habis. Tanpa pemeriksaan kamus, “beruang” akan dikupas menjadi “uang” — kata yang sah tetapi maknanya sama sekali lain, dan tidak ada aturan pengupasan yang bisa mencegahnya. Pada TF-IDF, kekeliruan lazimnya mengira kata yang sering muncul di semua dokumen berbobot tinggi.",
    diuji: "Menentukan kata dasar sebuah kata berimbuhan, menghitung TF-IDF satu kata, dan menjelaskan kenapa kata yang muncul di mana-mana justru tidak informatif.",
    rumus: [
      { nama: "TF-IDF", ekspresi: "tf-idf = tf × log(N / df)" },
    ],
  },
  {
    sesi: 11,
    judul: "Sistem Pakar",
    inti: "Sistem pakar memisahkan pengetahuan dari mesin inferensinya, sehingga pakar bisa mengubah aturan tanpa menyentuh kode. Runut maju bertanya “apa yang bisa disimpulkan”; runut mundur bertanya “benarkah dugaan ini, dan gejala mana yang masih perlu saya tanyakan”. Keduanya memakai basis aturan yang sama.",
    keliru: "Menganggap fasilitas penjelasan sebagai pelengkap. Sistem pakar yang tidak bisa menjawab “kenapa” hanyalah tebakan bercangkang komputer. Cacat yang paling sulit ditemukan: fakta yang dipakai sebagai premis tetapi tidak bisa disimpulkan maupun ditanyakan — ia diam-diam dianggap tidak berlaku, tanpa satu pun pesan galat.",
    diuji: "Menelusuri runut maju pada basis aturan kecil sampai keadaan tetap, dan menyebutkan komponen sistem pakar. Sering digabung dengan certainty factor sesi 3.",
    rumus: [],
  },
  {
    sesi: 12,
    judul: "Sains Data dan Big Data",
    inti: "Tiga V — Volume, Velocity, Variety — bukan sekadar sifat data melainkan tiga alasan berbeda kenapa perkakas lama berhenti bekerja. Volume memaksa penyimpanan tersebar, Velocity memaksa pemrosesan aliran, dan Variety memaksa skema yang tidak ditetapkan di muka.",
    keliru: "Mengira big data hanya soal ukuran. Data seratus gigabita yang datang sekali setahun jauh lebih mudah ditangani daripada satu gigabita per detik, dan keduanya membutuhkan perkakas yang sama sekali berbeda.",
    diuji: "Menyebutkan dan menjelaskan tiga V, dan membedakan tahapan dalam alur kerja sains data. Hampir seluruhnya pilihan ganda.",
    rumus: [],
  },
  {
    sesi: 13,
    judul: "Pembelajaran Mesin",
    inti: "Entropi mengukur ketidakpastian dalam satuan bit: nol berarti seluruh data satu kelas, satu bit berarti dua kelas berimbang sempurna. ID3 memilih atribut yang paling banyak menurunkannya. Yang layak diperhatikan bukan atribut mana yang menang, melainkan jaraknya ke urutan kedua — kalau nyaris sama, pohonnya rapuh.",
    keliru: "Memakai rata-rata biasa alih-alih rata-rata berbobot saat menghitung entropi sesudah pemecahan; cabang berisi satu data akan dihitung sama pentingnya dengan cabang berisi sepuluh. Kekeliruan kedua: lupa tanda negatif di depan rumus entropi, sehingga hasilnya keluar negatif.",
    diuji: "Menghitung entropi sebuah sebaran, menghitung perolehan informasi satu atribut, dan menentukan atribut pemecah pertama. Ditambah kNN dan k-means yang biasanya berupa perhitungan jarak.",
    rumus: [
      { nama: "Entropi", ekspresi: "H(S) = −Σ pᵢ · log₂(pᵢ)" },
      { nama: "Perolehan informasi", ekspresi: "IG(S,A) = H(S) − Σ (|Sᵥ|/|S|)·H(Sᵥ)" },
      { nama: "Gini", ekspresi: "Gini(S) = 1 − Σ pᵢ²" },
      { nama: "Jarak Euclidean", ekspresi: "d = √(Σ (aᵢ − bᵢ)²)" },
    ],
  },
  {
    sesi: 14,
    judul: "Robotika",
    inti: "Kendali PID menggabungkan tiga cara memandang galat: yang sekarang, yang menumpuk, dan yang sedang berubah. Yang membuat sistem stabil bukan penguatan yang besar melainkan yang seimbang di antara ketiganya — menaikkan salah satunya sendirian hampir selalu membuatnya berayun.",
    keliru: "Mengira bagian proporsional saja cukup. Ia selalu menyisakan galat tunak, karena saat galatnya kecil koreksinya ikut kecil dan tidak pernah menutup sisanya; itulah tugas bagian integral. Pada kinematika, kekeliruan lazimnya mengira kinematika balik selalu punya satu jawaban.",
    diuji: "Menyebutkan peran tiap bagian PID, dan membedakan kinematika maju dari balik. Kadang disertai perhitungan posisi ujung lengan dari sudut sendinya.",
    rumus: [
      { nama: "Kendali PID", ekspresi: "u(t) = Kp·e + Ki·∫e dt + Kd·de/dt" },
      { nama: "Kinematika maju dua sendi", ekspresi: "x = L₁cos θ₁ + L₂cos(θ₁+θ₂)" },
    ],
  },
];
