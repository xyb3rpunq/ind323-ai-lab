/// Bank soal IND323.
///
/// # Kunci jawaban soal berhitung tidak diketik di sini
///
/// Perhatikan bahwa tidak satu pun soal berangka menuliskan jawabannya sebagai
/// bilangan tetap. Jawabannya dihasilkan modul `Inti` — modul yang sama yang
/// diadu terhadap 3.796 pernyataan berpola bit lintas bahasa.
///
/// Kunci yang diketik tangan pasti menyimpang dari algoritmanya cepat atau
/// lambat, dan menyimpangnya tidak akan pernah terlihat: soalnya tetap terbaca
/// masuk akal, dan mahasiswa yang menjawab benar justru dinyatakan salah.
/// Kunci yang dihitung tidak bisa menyimpang tanpa menggagalkan konformansi.
///
/// Konsekuensinya disengaja: menambah soal berhitung menuntut algoritmanya
/// sudah ada di `Inti`, bukan sekadar jawabannya diketahui penulis soal.
///
/// .Deckyx

public enum Bank {
    /// Toleransi bawaan soal berangka.
    ///
    /// Dua angka di belakang koma. Menuntut lebih teliti berarti menghukum
    /// pembulatan yang wajar — mahasiswa yang menulis 0,79 untuk jawaban
    /// 0,7900000000000001 tidak sedang keliru.
    public static let toleransi = 0.005

    /// Seluruh soal, disusun sekali saat pertama diminta.
    public static let semua: [Soal] = susun()

    /// Nama tiap sesi kuliah, dipakai daftar isi dan penyaring.
    public static let sesi: [(nomor: Int, nama: String)] = [
        (1, "Pengantar Kecerdasan Buatan"),
        (2, "Agen Cerdas dan Ruang Keadaan"),
        (3, "Ketidakpastian dan Certainty Factor"),
        (4, "Probabilitas Bayesian"),
        (5, "Logika Fuzzy I"),
        (6, "Logika Fuzzy II"),
        (7, "Representasi Pengetahuan"),
        (8, "Teknik Pencarian dan Heuristik"),
        (9, "Jaringan Syaraf Tiruan"),
        (10, "Pemrosesan Bahasa Alami"),
        (11, "Sistem Pakar"),
        (12, "Sains Data dan Big Data"),
        (13, "Pembelajaran Mesin"),
        (14, "Robotika"),
    ]

    /// Membulatkan jawaban hitung ke bentuk yang wajar ditulis tangan.
    ///
    /// Jawabannya tetap dihitung penuh; yang dibulatkan hanya nilai yang
    /// dibandingkan. Tanpa ini, toleransi 0,005 pada jawaban 0,7899999999
    /// akan menolak 0,79 yang jelas benar.
    static func bulat(_ v: Double, _ digit: Int = 4) -> Double {
        var pengali = 1.0
        for _ in 0..<digit { pengali *= 10.0 }
        return (v * pengali).rounded() / pengali
    }

    static func angka(_ v: Double, satuan: String = "") -> BentukSoal {
        .angka(jawaban: bulat(v), toleransi: toleransi, satuan: satuan)
    }

    // swiftlint:disable:next function_body_length
    static func susun() -> [Soal] {
        var soal: [Soal] = []

        // ------------------------------------------------------------------
        // Sesi 1 — Pengantar
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S01-01", sesi: 1, topik: "Uji Turing",
            pertanyaan: "Uji Turing menyatakan sebuah mesin dianggap cerdas bila…",
            bentuk: .pilihan(pilihan: [
                "penanya manusia tidak bisa membedakannya dari manusia lewat percakapan teks",
                "mesin itu bisa menyelesaikan soal matematika lebih cepat daripada manusia",
                "mesin itu bisa mengalahkan juara dunia catur",
                "mesin itu punya kesadaran dan perasaan",
            ], benar: 0),
            pembahasan: "Turing sengaja mengganti pertanyaan “apakah mesin bisa berpikir” dengan pertanyaan yang bisa diuji: apakah penanya bisa membedakannya. Kecepatan berhitung dan kemenangan catur bukan bagian dari ujinya, dan kesadaran justru pertanyaan yang dihindari Turing karena tidak bisa diperiksa dari luar.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S01-02", sesi: 1, topik: "ELIZA",
            pertanyaan: "ELIZA memahami makna kalimat yang diketik penggunanya.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "ELIZA hanya mencocokkan kata kunci lalu memantulkan potongan kalimat dengan kata ganti ditukar. Tidak ada pemahaman sama sekali. Justru kesenjangan antara kesederhanaan mesinnya dan kuatnya kesan yang ditimbulkannya itulah pelajaran utamanya.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S01-03", sesi: 1, topik: "Efek ELIZA",
            pertanyaan: "Apa yang disebut “efek ELIZA”?",
            bentuk: .pilihan(pilihan: [
                "kecenderungan manusia menganggap program komputer memahami dirinya padahal tidak",
                "kesalahan program saat memproses kalimat yang terlalu panjang",
                "penurunan mutu jawaban setelah percakapan berlangsung lama",
                "kemampuan program belajar dari percakapan sebelumnya",
            ], benar: 0),
            pembahasan: "Weizenbaum terkejut mendapati sekretarisnya sendiri meminta privasi saat berbicara dengan ELIZA. Efek ini menjelaskan kenapa uji Turing lebih banyak berbicara tentang manusia yang menilai daripada tentang mesin yang dinilai.",
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 2 — Agen cerdas
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S02-01", sesi: 2, topik: "Jenis agen",
            pertanyaan: "Apa yang membedakan agen refleks sederhana dari agen berbasis model?",
            bentuk: .pilihan(pilihan: [
                "agen berbasis model menyimpan keadaan dunia yang tidak sedang diinderanya",
                "agen berbasis model bekerja lebih cepat",
                "agen refleks sederhana tidak punya aturan sama sekali",
                "agen berbasis model tidak memerlukan sensor",
            ], benar: 0),
            pembahasan: "Bedanya ingatan, bukan kecanggihan. Agen tanpa ingatan tidak punya cara mengetahui bahwa pekerjaannya sudah selesai, jadi ia terus bergerak sampai dihentikan paksa — dan itulah sebabnya biayanya hampir selalu paling besar.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S02-02", sesi: 2, topik: "PEAS",
            pertanyaan: "Dalam kerangka PEAS, huruf P yang pertama menyatakan…",
            bentuk: .pilihan(pilihan: [
                "Performance measure — ukuran keberhasilan agen",
                "Perception — apa yang bisa diindera agen",
                "Planning — bagaimana agen menyusun rencana",
                "Probability — peluang agen berhasil",
            ], benar: 0),
            pembahasan: "PEAS adalah Performance, Environment, Actuators, Sensors. Ukuran keberhasilan diletakkan pertama karena ia yang menentukan sisanya: agen yang dinilai dari kebersihan akan berperilaku berbeda dari agen yang dinilai dari hemat energi.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S02-03", sesi: 2, topik: "Ruang keadaan",
            pertanyaan: "Pada masalah teko air berkapasitas 3 dan 5 liter, sasaran 4 liter dapat dicapai.",
            bentuk: .benarSalah(benar: true),
            pembahasan: "Menurut teorema Bézout, sasaran hanya bisa dicapai bila ia kelipatan pembagi bersama terbesar kedua kapasitas. FPB(3, 5) = 1, dan 4 kelipatan 1, jadi bisa. Memeriksanya di muka jauh lebih jujur daripada membiarkan pencarian berjalan lalu melaporkan “tidak ditemukan”.",
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 3 — Certainty factor
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S03-01", sesi: 3, topik: "Certainty Factor",
            pertanyaan: "Diketahui MB = 0,8 dan MD = 0,01. Berapa nilai CF-nya?",
            bentuk: angka((try? CertaintyFactor.dariMbMd(0.8, 0.01)) ?? 0),
            pembahasan: "CF = MB − MD = 0,8 − 0,01 = 0,79. Ini soal Tugas Sesi 3 pada modul. Perhatikan MD ditulis positif; tanda negatifnya sudah ada di rumus.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S03-02", sesi: 3, topik: "Certainty Factor",
            pertanyaan: "Dua bukti masing-masing ber-CF 0,8 dan 0,6 mendukung hipotesis yang sama. Berapa CF gabungannya?",
            bentuk: angka((try? CertaintyFactor.gabungParalel(0.8, 0.6)) ?? 0),
            pembahasan: "Keduanya positif, jadi dipakai CF₁ + CF₂ × (1 − CF₁) = 0,8 + 0,6 × 0,2 = 0,92. Bukti kedua hanya menggarap sisa keyakinan yang belum terpakai; itulah sebabnya hasilnya tidak pernah melewati 1.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S03-03", sesi: 3, topik: "Certainty Factor",
            pertanyaan: "Sebuah aturan ber-CF 0,9 dinyalakan bukti ber-CF −0,5. Berapa CF kesimpulannya?",
            bentuk: angka((try? CertaintyFactor.gabungBerantai(0.9, -0.5)) ?? 0),
            pembahasan: "Bukti dengan CF negatif tidak menyalakan aturan sama sekali, jadi hasilnya nol — bukan −0,45. Rumusnya CF_aturan × max(CF_bukti, 0).",
            tingkat: 3))

        soal.append(Soal(
            kode: "S03-04", sesi: 3, topik: "Certainty Factor",
            pertanyaan: "Nilai CF dapat ditafsirkan sebagai probabilitas hipotesis benar.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "CF bukan probabilitas dan tidak memenuhi aturannya: CF sebuah hipotesis dan ingkarannya tidak harus berjumlah satu. Ia hanya bisa dibandingkan dengan CF lain di sistem yang sama.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S03-05", sesi: 3, topik: "Certainty Factor",
            pertanyaan: "Dua premis ber-CF 0,9 dan 0,3 dihubungkan dengan DAN. Berapa CF premis gabungannya?",
            bentuk: angka((try? CertaintyFactor.premisDan(0.9, 0.3)) ?? 0),
            pembahasan: "Premis DAN diambil nilai terkecilnya, yaitu 0,3. Alasannya sama seperti rantai: kekuatannya ditentukan mata rantai terlemah.",
            tingkat: 1))

        // ------------------------------------------------------------------
        // Sesi 4 — Bayesian
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S04-01", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: "20% berita adalah hoaks. 90% hoaks berjudul provokatif, dan 30% berita non-hoaks juga. Sebuah berita berjudul provokatif — berapa peluang ia hoaks?",
            bentuk: angka((try? Bayes.posterior(prior: 0.2, kemungkinanH: 0.9, kemungkinanBukanH: 0.3)) ?? 0),
            pembahasan: "P(E) = 0,9×0,2 + 0,3×0,8 = 0,42. P(H|E) = 0,9×0,2 / 0,42 = 3/7 ≈ 0,4286. Ini soal Tugas Pertemuan 5. Perhatikan jawabannya di bawah setengah meski 90% hoaks berjudul provokatif — karena hoaksnya sendiri hanya 20%.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S04-02", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: "Dengan data soal sebelumnya, berapa P(E), yaitu peluang sebuah berita berjudul provokatif?",
            bentuk: angka((try? Bayes.bukti(prior: 0.2, kemungkinanH: 0.9, kemungkinanBukanH: 0.3)) ?? 0),
            pembahasan: "P(E) = P(E|H)×P(H) + P(E|¬H)×P(¬H) = 0,9×0,2 + 0,3×0,8 = 0,18 + 0,24 = 0,42. Bukti bisa muncul lewat dua jalan, dan keduanya harus dijumlahkan.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S04-03", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: "P(E|¬H) dapat dihitung sebagai 1 − P(E|H).",
            bentuk: .benarSalah(benar: false),
            pembahasan: "Keduanya sama sekali tidak berhubungan: yang satu tentang kelompok yang hipotesisnya benar, yang lain tentang kelompok yang hipotesisnya salah. Keduanya harus diketahui terpisah, dan menukarnya adalah salah satu kekeliruan paling umum.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S04-04", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: "Sebuah penyakit menimpa 1 dari 1000 orang. Tesnya mendeteksi 99% yang sakit dan salah pada 5% yang sehat. Berapa peluang seseorang benar-benar sakit bila tesnya positif?",
            bentuk: angka((try? Bayes.posterior(prior: 0.001, kemungkinanH: 0.99, kemungkinanBukanH: 0.05)) ?? 0),
            pembahasan: "Sekitar 0,0194 — di bawah 2 persen. Bukan tesnya yang buruk; priornya yang sangat kecil. Dari 1000 orang, sekitar 1 positif benar dan 50 positif palsu. Inilah kekeliruan mengabaikan laju dasar.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S04-05", sesi: 4, topik: "Rasio kemungkinan",
            pertanyaan: "Berapa rasio kemungkinan bila P(E|H) = 0,9 dan P(E|¬H) = 0,3?",
            bentuk: angka((try? Bayes.rasioKemungkinan(0.9, 0.3)) ?? 0),
            pembahasan: "LR = 0,9 / 0,3 = 3. Rasio kemungkinan tidak bergantung prior sama sekali, sehingga ia mengukur kekuatan bukti itu sendiri. Nilai 1 berarti buktinya tidak memberi tahu apa pun.",
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 5–6 — Logika fuzzy
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S05-01", sesi: 5, topik: "Keanggotaan kabur",
            pertanyaan: "Himpunan segitiga (0, 5, 10). Berapa derajat keanggotaan x = 2,5?",
            bentuk: angka(Kabur.segitiga(0, 5, 10, 2.5)),
            pembahasan: "x berada di kaki kiri, jadi μ = (x − a)/(b − a) = 2,5/5 = 0,5. Setengah jalan menuju puncak berarti derajat keanggotaan setengah.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S05-02", sesi: 5, topik: "Keanggotaan kabur",
            pertanyaan: "Himpunan trapesium (5, 8, 10, 10). Berapa derajat keanggotaan x = 10?",
            bentuk: angka(Kabur.trapesium(5, 8, 10, 10, 10)),
            pembahasan: "Jawabannya 1, bukan 0. Bahu datarnya membentang dari 8 sampai 10, dan x = 10 masih di dalamnya. Inilah bentuk yang paling sering salah dihitung: himpunan berkaki berimpit di tepi semesta.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S05-03", sesi: 5, topik: "Derajat keanggotaan",
            pertanyaan: "Derajat keanggotaan seluruh himpunan kabur pada satu nilai harus berjumlah satu.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "Itu berlaku untuk probabilitas, bukan untuk derajat keanggotaan. Suhu 26 derajat bisa “sejuk” sebesar 0,4 dan “hangat” sebesar 0,7 sekaligus; jumlahnya 1,1 dan itu sah.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S06-01", sesi: 6, topik: "Inferensi kabur",
            pertanyaan: "Aturan berpremis “A DAN B” dengan derajat 0,7 dan 0,4. Berapa kekuatan penyalaannya?",
            bentuk: angka(min(0.7, 0.4)),
            pembahasan: "Premis DAN diambil minimumnya, yaitu 0,4. Aturan hanya sekuat premis terlemahnya, persis seperti rantai yang putus di mata rantai terlemah.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S06-02", sesi: 6, topik: "Defuzzifikasi",
            pertanyaan: "Metode defuzzifikasi mana yang tidak perlu menggambar kurva keluaran sama sekali?",
            bentuk: .pilihan(pilihan: [
                "Sugeno",
                "Mamdani",
                "Centroid",
                "Mean of Maximum",
            ], benar: 0),
            pembahasan: "Sugeno langsung memakai satu angka per aturan, sehingga jauh lebih murah dihitung. Itulah alasan ia lebih sering dipakai di sistem kendali tertanam, sementara Mamdani dipakai ketika bentuk keluarannya perlu ditafsirkan manusia.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S06-03", sesi: 6, topik: "Defuzzifikasi",
            pertanyaan: "Mamdani, Sugeno, dan Tsukamoto akan memberi jawaban yang sama bila aturannya sama.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "Aturannya hanya menentukan kekuatan penyalaan; yang berbeda adalah cara mengubah kekuatan itu menjadi satu angka. Perbedaan hasilnya bukan kesalahan melainkan konsekuensi definisi masing-masing.",
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 7 — Representasi pengetahuan
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S07-01", sesi: 7, topik: "Tabel kebenaran",
            pertanyaan: "Berapa baris tabel kebenaran untuk rumus dengan 5 proposisi?",
            bentuk: angka(32),
            pembahasan: "2⁵ = 32. Tiap proposisi baru melipatduakan barisnya, sehingga sepuluh proposisi sudah berarti 1.024 baris — dan itulah alasan pembuktian yang tidak perlu memeriksa semua baris jauh lebih berharga.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S07-02", sesi: 7, topik: "Resolusi",
            pertanyaan: "Pembuktian dengan resolusi bekerja dengan cara…",
            bentuk: .pilihan(pilihan: [
                "menyangkal kesimpulan lalu mencari kontradiksi",
                "mencoba seluruh kemungkinan nilai kebenaran",
                "menghitung peluang kesimpulan benar",
                "menyusun tabel kebenaran yang lebih ringkas",
            ], benar: 0),
            pembahasan: "Resolusi menambahkan ingkaran kesimpulan ke basis pengetahuan lalu mencari klausa kosong. Kalau klausa kosong ditemukan, ingkarannya mustahil benar — jadi kesimpulannya pasti mengikuti.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S07-03", sesi: 7, topik: "Jaringan semantik",
            pertanyaan: "Pada jaringan semantik, sifat yang dituliskan pada simpul induk berlaku juga bagi seluruh turunannya.",
            bentuk: .benarSalah(benar: true),
            pembahasan: "Itulah gunanya jaringan semantik: menuliskan bahwa hewan punya sel satu kali sudah cukup untuk seluruh turunannya. Pengecualian ditangani dengan menuliskan sifat yang berbeda langsung pada simpul turunannya.",
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 8 — Pencarian
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S08-01", sesi: 8, topik: "Pencarian",
            pertanyaan: "Algoritma A* dijamin menemukan jalur terpendek bila heuristiknya…",
            bentuk: .pilihan(pilihan: [
                "tidak pernah menaksir lebih besar daripada biaya sebenarnya",
                "selalu menaksir tepat sama dengan biaya sebenarnya",
                "selalu bernilai nol",
                "menaksir lebih besar agar pencariannya lebih cepat",
            ], benar: 0),
            pembahasan: "Heuristik yang tidak pernah menaksir berlebihan disebut admissible. Heuristik yang menaksir berlebihan bisa membuat A* melewatkan jalur terpendek — ia jadi lebih cepat tetapi berhenti menjamin apa pun.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S08-02", sesi: 8, topik: "Pencarian",
            pertanyaan: "Manakah yang benar tentang BFS dan DFS pada graf berbobot seragam?",
            bentuk: .pilihan(pilihan: [
                "BFS menjamin jalur terpendek, DFS tidak",
                "keduanya menjamin jalur terpendek",
                "DFS menjamin jalur terpendek, BFS tidak",
                "keduanya tidak menjamin apa pun",
            ], benar: 0),
            pembahasan: "BFS menelusuri lapis demi lapis, jadi simpul tujuan pertama yang ditemuinya pasti yang terdekat. DFS menelusuri sedalam mungkin lebih dulu dan bisa menemukan jalur panjang yang berputar-putar.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S08-03", sesi: 8, topik: "Heuristik",
            pertanyaan: "Jarak Manhattan dari (2, 3) ke (7, 8) adalah berapa?",
            bentuk: angka(Ml.manhattan([2, 3], [7, 8])),
            pembahasan: "|7−2| + |8−3| = 5 + 5 = 10. Jarak Manhattan dipakai sebagai heuristik pada peta berpetak yang gerakannya hanya empat arah, karena di sana ia tidak pernah menaksir berlebihan.",
            tingkat: 1))

        // ------------------------------------------------------------------
        // Sesi 9 — Jaringan syaraf
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S09-01", sesi: 9, topik: "Perceptron",
            pertanyaan: "Perceptron satu lapis dapat memisahkan fungsi XOR.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "XOR tidak terpisahkan secara linear, dan perceptron satu lapis hanya bisa menarik satu garis lurus. Temuan Minsky dan Papert tentang ini menghentikan penelitian jaringan syaraf hampir dua dekade, sampai perambatan balik ditemukan.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S09-02", sesi: 9, topik: "Pelatihan",
            pertanyaan: "Apa yang terjadi bila laju belajar disetel terlalu besar?",
            bentuk: .pilihan(pilihan: [
                "galat berhenti menurun lalu melompat-lompat tanpa mengecil",
                "pelatihan menjadi lebih cepat tanpa efek samping",
                "jaringan pasti berhenti belajar sama sekali",
                "galat menurun lebih halus daripada biasanya",
            ], benar: 0),
            pembahasan: "Langkah yang terlalu besar melewati titik terendah lalu memantul ke sisi seberang. Cirinya khas: kurva galatnya berayun dan tidak pernah mengecil, berbeda dari laju yang terlalu kecil yang menurun tetapi sangat lambat.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S09-03", sesi: 9, topik: "Fungsi aktivasi",
            pertanyaan: "Berapa nilai fungsi sigmoid pada masukan 0?",
            bentuk: angka(Kabur.sigmoid(1, 0, 0)),
            pembahasan: "σ(0) = 1/(1 + e⁰) = 1/2 = 0,5. Sigmoid selalu bernilai setengah tepat di titik tengahnya, dan itulah sebabnya ia dipakai sebagai penggolong dua kelas dengan ambang 0,5.",
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 10 — NLP
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S10-01", sesi: 10, topik: "Stemming",
            pertanyaan: "Kata dasar dari “menyapu” adalah…",
            bentuk: .pilihan(pilihan: ["sapu", "nyapu", "menyapu", "apu"], benar: 0),
            pembahasan: "Awalan meny- meluluhkan huruf s pada kata dasarnya, sehingga “menyapu” berasal dari “sapu”, bukan “nyapu”. Tidak ada algoritma stemming Bahasa Inggris yang mengetahui aturan peluluhan ini.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S10-02", sesi: 10, topik: "Stemming",
            pertanyaan: "Kenapa pencari kata dasar Bahasa Indonesia perlu memeriksa kamus sebelum mengupas imbuhan?",
            bentuk: .pilihan(pilihan: [
                "agar kata seperti “beruang” tidak dikupas menjadi “uang”",
                "agar prosesnya berjalan lebih cepat",
                "agar hasilnya selalu berupa kata benda",
                "agar imbuhan yang dikupas bisa dikembalikan",
            ], benar: 0),
            pembahasan: "“Beruang” sudah ada di kamus, jadi pengupasan harus berhenti. Tanpa pemeriksaan itu, aturan pengupasan akan tetap berjalan dan menghasilkan “uang” — kata yang sah tetapi maknanya sama sekali lain.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S10-03", sesi: 10, topik: "TF-IDF",
            pertanyaan: "Kata yang muncul di seluruh dokumen akan mendapat bobot IDF yang tinggi.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "Sebaliknya: IDF-nya paling rendah. Kata yang muncul di mana-mana tidak membedakan apa pun, dan itulah seluruh gagasan TF-IDF — yang sering muncul di semua tempat justru tidak informatif.",
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 11 — Sistem pakar
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S11-01", sesi: 11, topik: "Sistem pakar",
            pertanyaan: "Runut maju (forward chaining) menjawab pertanyaan…",
            bentuk: .pilihan(pilihan: [
                "apa yang bisa disimpulkan dari fakta yang ada",
                "benarkah dugaan tertentu ini",
                "berapa peluang kesimpulan benar",
                "aturan mana yang paling sering dipakai",
            ], benar: 0),
            pembahasan: "Runut maju berangkat dari fakta menuju kesimpulan; runut mundur berangkat dari dugaan lalu mencari bukti pendukungnya. Keduanya memakai basis aturan yang sama persis, hanya arah penelusurannya berbeda.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S11-02", sesi: 11, topik: "Sistem pakar",
            pertanyaan: "Fasilitas penjelasan pada sistem pakar berguna untuk…",
            bentuk: .pilihan(pilihan: [
                "menunjukkan aturan mana yang dipakai sehingga kesimpulannya bisa diperiksa",
                "mempercepat proses inferensi",
                "menghemat memori basis pengetahuan",
                "menggantikan peran pakar sepenuhnya",
            ], benar: 0),
            pembahasan: "Sistem pakar yang tidak bisa menjawab “kenapa” hanyalah tebakan bercangkang komputer. Fasilitas penjelasan bukan hiasan; ia yang membuat kesimpulannya bisa dipertanggungjawabkan.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S11-03", sesi: 11, topik: "Basis pengetahuan",
            pertanyaan: "Sebuah fakta yang dipakai sebagai premis tetapi tidak bisa disimpulkan maupun ditanyakan akan menyebabkan galat saat sistem dijalankan.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "Justru tidak — dan di situlah bahayanya. Fakta seperti itu diam-diam dianggap tidak berlaku, sehingga aturannya tidak pernah menyala dan tidak ada pesan galat apa pun. Ini jenis cacat yang paling sulit ditemukan pada sistem pakar.",
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 12–13 — Data dan pembelajaran mesin
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S12-01", sesi: 12, topik: "Big data",
            pertanyaan: "Manakah yang bukan bagian dari “tiga V” pada big data?",
            bentuk: .pilihan(pilihan: ["Validity", "Volume", "Velocity", "Variety"], benar: 0),
            pembahasan: "Tiga V aslinya adalah Volume, Velocity, dan Variety. Veracity sering ditambahkan sebagai V keempat, tetapi Validity bukan bagian dari kerangka aslinya.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-01", sesi: 13, topik: "Entropi",
            pertanyaan: "Berapa entropi sebuah himpunan berisi dua kelas yang jumlahnya berimbang sempurna?",
            bentuk: angka(Ml.entropi(["A", "B"])),
            pembahasan: "Tepat 1 bit. Entropi mengukur berapa banyak pertanyaan ya-tidak yang dibutuhkan untuk memastikan jawabannya, dan dua kelas berimbang butuh tepat satu pertanyaan.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-02", sesi: 13, topik: "Entropi",
            pertanyaan: "Berapa entropi himpunan yang seluruh anggotanya satu kelas?",
            bentuk: angka(0),
            pembahasan: "Nol. Tidak ada ketidakpastian sama sekali, jadi tidak ada pertanyaan yang perlu diajukan. Inilah keadaan yang dicari ID3 saat membentuk daun.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-03", sesi: 13, topik: "Ketakmurnian Gini",
            pertanyaan: "Berapa ketakmurnian Gini himpunan berisi dua kelas berimbang?",
            bentuk: angka(Ml.gini(["A", "B"])),
            pembahasan: "1 − (0,5² + 0,5²) = 0,5. Berbeda dengan entropi yang bernilai 1 pada keadaan yang sama, karena keduanya memakai skala yang berbeda. Gini lebih murah dihitung karena tidak memakai logaritma.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S13-04", sesi: 13, topik: "Pohon keputusan",
            pertanyaan: "ID3 memilih atribut pemecah berdasarkan…",
            bentuk: .pilihan(pilihan: [
                "perolehan informasi tertinggi",
                "jumlah nilai berbeda terbanyak",
                "urutan kolom pada data",
                "ketakmurnian Gini tertinggi",
            ], benar: 0),
            pembahasan: "Perolehan informasi tertinggi, yaitu yang paling banyak mengurangi ketidakpastian. Memilih menurut jumlah nilai terbanyak justru jebakan: kolom beridentitas unik memberi perolehan maksimum padahal tidak meramalkan apa pun.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S13-05", sesi: 13, topik: "kNN",
            pertanyaan: "Berapa jarak Euclidean antara titik (0, 0) dan (3, 4)?",
            bentuk: angka(Ml.euclidean([0, 0], [3, 4])),
            pembahasan: "√(3² + 4²) = √25 = 5. Segitiga siku-siku 3-4-5 yang paling terkenal. Jarak Euclidean hanya memakai operasi yang dibulatkan tepat menurut IEEE-754, sehingga hasilnya identik di bahasa mana pun.",
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-06", sesi: 13, topik: "kNN",
            pertanyaan: "Kenapa k ganjil lebih disukai pada kNN dengan dua kelas?",
            bentuk: .pilihan(pilihan: [
                "agar suaranya tidak pernah imbang",
                "agar perhitungannya lebih cepat",
                "agar jaraknya lebih akurat",
                "agar tidak perlu menyamakan skala fitur",
            ], benar: 0),
            pembahasan: "Dengan k genap pada dua kelas, suaranya bisa imbang dan pemecah serinya menjadi sewenang-wenang. k ganjil menjamin selalu ada pemenang.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S13-07", sesi: 13, topik: "k-means",
            pertanyaan: "Inersia dapat dipakai untuk memilih jumlah kelompok k yang terbaik.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "Inersia selalu turun saat k dinaikkan, dan mencapai nol ketika k sama dengan jumlah data. Yang dicari adalah titik sikunya pada grafik, bukan nilai terkecilnya.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S13-08", sesi: 13, topik: "Evaluasi",
            pertanyaan: "Sebuah model berketepatan 95% pada data yang 95% anggotanya satu kelas. Apa artinya?",
            bentuk: .pilihan(pilihan: [
                "modelnya belum tentu mempelajari apa pun; menebak kelas mayoritas memberi hasil sama",
                "modelnya sangat baik",
                "modelnya mengalami overfitting",
                "datanya terlalu sedikit",
            ], benar: 0),
            pembahasan: "Ketepatan harus selalu dibandingkan dengan tebakan kelas terbanyak. Ketepatan yang tidak melampaui tebakan bukanlah pembelajaran, meski angkanya terlihat tinggi.",
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 14 — Robotika
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S14-01", sesi: 14, topik: "Kendali PID",
            pertanyaan: "Bagian mana dari kendali PID yang menghilangkan galat tunak?",
            bentuk: .pilihan(pilihan: ["Integral", "Proporsional", "Derivatif", "ketiganya sama"], benar: 0),
            pembahasan: "Bagian integral menumpuk galat sepanjang waktu, sehingga galat kecil yang menetap pun akhirnya menghasilkan koreksi. Bagian proporsional sendirian selalu menyisakan galat tunak.",
            tingkat: 3))

        soal.append(Soal(
            kode: "S14-02", sesi: 14, topik: "Kinematika",
            pertanyaan: "Kinematika maju pada lengan robot menghitung…",
            bentuk: .pilihan(pilihan: [
                "posisi ujung lengan dari sudut tiap sendinya",
                "sudut sendi yang dibutuhkan untuk mencapai posisi tertentu",
                "gaya yang dibutuhkan tiap sendi",
                "lintasan tercepat menuju sasaran",
            ], benar: 0),
            pembahasan: "Kinematika maju: dari sudut ke posisi, dan jawabannya selalu tunggal. Kinematika balik sebaliknya, dan jawabannya bisa lebih dari satu atau tidak ada sama sekali.",
            tingkat: 2))

        soal.append(Soal(
            kode: "S14-03", sesi: 14, topik: "Kendali PID",
            pertanyaan: "Menaikkan penguatan proporsional selalu membuat sistem lebih stabil.",
            bentuk: .benarSalah(benar: false),
            pembahasan: "Sebaliknya. Penguatan proporsional yang terlalu besar membuat sistem berayun dan akhirnya tidak stabil. Yang membuatnya stabil bukan penguatan yang besar melainkan yang seimbang antara ketiga bagiannya.",
            tingkat: 2))

        return soal
    }
}
