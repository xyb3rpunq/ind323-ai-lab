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
/// # Kenapa isinya dwibahasa
///
/// Karena situsnya dwibahasa, dan bank soal yang tidak ikut membuat separuh
/// halaman berganti bahasa sementara separuhnya — bagian yang justru dibaca
/// paling lama — tidak. Kelas pascasarjana mana pun punya pembaca yang tidak
/// bisa membaca yang pertama.
///
/// Yang **tidak** ikut diterjemahkan: `kode` dan `topik`. Keduanya kunci, bukan
/// teks yang dibaca. `topik` dipakai mengelompokkan ketepatan per topik, dan
/// kunci yang ikut berganti bahasa menghasilkan dua ringkasan yang tidak bisa
/// dibandingkan satu sama lain.
///
/// Indeks jawaban benar juga tidak menunjuk ke teks mana pun, sehingga
/// menerjemahkan pilihan tidak bisa menggeser kuncinya.
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
    public static let sesi: [(nomor: Int, nama: Dwibahasa)] = [
        (1, bi("Pengantar Kecerdasan Buatan", "Introduction to Artificial Intelligence")),
        (2, bi("Agen Cerdas dan Ruang Keadaan", "Intelligent Agents and State Spaces")),
        (3, bi("Ketidakpastian dan Certainty Factor", "Uncertainty and the Certainty Factor")),
        (4, bi("Probabilitas Bayesian", "Bayesian Probability")),
        (5, bi("Logika Fuzzy I", "Fuzzy Logic I")),
        (6, bi("Logika Fuzzy II", "Fuzzy Logic II")),
        (7, bi("Representasi Pengetahuan", "Knowledge Representation")),
        (8, bi("Teknik Pencarian dan Heuristik", "Search Techniques and Heuristics")),
        (9, bi("Jaringan Syaraf Tiruan", "Artificial Neural Networks")),
        (10, bi("Pemrosesan Bahasa Alami", "Natural Language Processing")),
        (11, bi("Sistem Pakar", "Expert Systems")),
        (12, bi("Sains Data dan Big Data", "Data Science and Big Data")),
        (13, bi("Pembelajaran Mesin", "Machine Learning")),
        (14, bi("Robotika", "Robotics")),
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

    static func angka(_ v: Double, satuan: Dwibahasa = bi("", "")) -> BentukSoal {
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
            pertanyaan: bi(
                "Uji Turing menyatakan sebuah mesin dianggap cerdas bila…",
                "The Turing test holds that a machine counts as intelligent when…"),
            bentuk: .pilihan(pilihan: [
                bi("penanya manusia tidak bisa membedakannya dari manusia lewat percakapan teks",
                   "a human questioner cannot tell it from a human through a text conversation"),
                bi("mesin itu bisa menyelesaikan soal matematika lebih cepat daripada manusia",
                   "it can solve mathematical problems faster than a human"),
                bi("mesin itu bisa mengalahkan juara dunia catur",
                   "it can beat the world chess champion"),
                bi("mesin itu punya kesadaran dan perasaan",
                   "it possesses consciousness and feelings"),
            ], benar: 0),
            pembahasan: bi(
                "Turing sengaja mengganti pertanyaan “apakah mesin bisa berpikir” dengan pertanyaan yang bisa diuji: apakah penanya bisa membedakannya. Kecepatan berhitung dan kemenangan catur bukan bagian dari ujinya, dan kesadaran justru pertanyaan yang dihindari Turing karena tidak bisa diperiksa dari luar.",
                "Turing deliberately replaced the question “can a machine think” with one that can actually be tested: can the questioner tell the difference. Arithmetic speed and chess victories are no part of the test, and consciousness is precisely the question Turing avoided, because it cannot be examined from outside."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S01-02", sesi: 1, topik: "ELIZA",
            pertanyaan: bi(
                "ELIZA memahami makna kalimat yang diketik penggunanya.",
                "ELIZA understands the meaning of the sentences its user types."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "ELIZA hanya mencocokkan kata kunci lalu memantulkan potongan kalimat dengan kata ganti ditukar. Tidak ada pemahaman sama sekali. Justru kesenjangan antara kesederhanaan mesinnya dan kuatnya kesan yang ditimbulkannya itulah pelajaran utamanya.",
                "ELIZA only matches keywords and reflects fragments back with the pronouns swapped. There is no understanding at all. The gap between how simple the machine is and how strong an impression it leaves is the whole lesson."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S01-03", sesi: 1, topik: "Efek ELIZA",
            pertanyaan: bi(
                "Apa yang disebut “efek ELIZA”?",
                "What is known as the “ELIZA effect”?"),
            bentuk: .pilihan(pilihan: [
                bi("kecenderungan manusia menganggap program komputer memahami dirinya padahal tidak",
                   "the human tendency to assume a computer program understands them when it does not"),
                bi("kesalahan program saat memproses kalimat yang terlalu panjang",
                   "a program failure when a sentence is too long to process"),
                bi("penurunan mutu jawaban setelah percakapan berlangsung lama",
                   "a decline in answer quality once a conversation runs long"),
                bi("kemampuan program belajar dari percakapan sebelumnya",
                   "a program's ability to learn from earlier conversations"),
            ], benar: 0),
            pembahasan: bi(
                "Weizenbaum terkejut mendapati sekretarisnya sendiri meminta privasi saat berbicara dengan ELIZA. Efek ini menjelaskan kenapa uji Turing lebih banyak berbicara tentang manusia yang menilai daripada tentang mesin yang dinilai.",
                "Weizenbaum was startled to find his own secretary asking for privacy while talking to ELIZA. The effect explains why the Turing test says more about the humans doing the judging than about the machine being judged."),
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 2 — Agen cerdas
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S02-01", sesi: 2, topik: "Jenis agen",
            pertanyaan: bi(
                "Apa yang membedakan agen refleks sederhana dari agen berbasis model?",
                "What distinguishes a simple reflex agent from a model-based agent?"),
            bentuk: .pilihan(pilihan: [
                bi("agen berbasis model menyimpan keadaan dunia yang tidak sedang diinderanya",
                   "a model-based agent keeps track of the parts of the world it is not currently sensing"),
                bi("agen berbasis model bekerja lebih cepat",
                   "a model-based agent runs faster"),
                bi("agen refleks sederhana tidak punya aturan sama sekali",
                   "a simple reflex agent has no rules at all"),
                bi("agen berbasis model tidak memerlukan sensor",
                   "a model-based agent needs no sensors"),
            ], benar: 0),
            pembahasan: bi(
                "Bedanya ingatan, bukan kecanggihan. Agen tanpa ingatan tidak punya cara mengetahui bahwa pekerjaannya sudah selesai, jadi ia terus bergerak sampai dihentikan paksa — dan itulah sebabnya biayanya hampir selalu paling besar.",
                "The difference is memory, not sophistication. An agent without memory has no way of knowing its work is finished, so it keeps moving until something stops it — which is why its cost is nearly always the highest."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S02-02", sesi: 2, topik: "PEAS",
            pertanyaan: bi(
                "Dalam kerangka PEAS, huruf P yang pertama menyatakan…",
                "In the PEAS framework, the first P stands for…"),
            bentuk: .pilihan(pilihan: [
                bi("Performance measure — ukuran keberhasilan agen",
                   "Performance measure — how the agent's success is judged"),
                bi("Perception — apa yang bisa diindera agen",
                   "Perception — what the agent is able to sense"),
                bi("Planning — bagaimana agen menyusun rencana",
                   "Planning — how the agent builds a plan"),
                bi("Probability — peluang agen berhasil",
                   "Probability — how likely the agent is to succeed"),
            ], benar: 0),
            pembahasan: bi(
                "PEAS adalah Performance, Environment, Actuators, Sensors. Ukuran keberhasilan diletakkan pertama karena ia yang menentukan sisanya: agen yang dinilai dari kebersihan akan berperilaku berbeda dari agen yang dinilai dari hemat energi.",
                "PEAS is Performance, Environment, Actuators, Sensors. The performance measure comes first because it determines everything else: an agent judged on cleanliness behaves differently from one judged on energy saved."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S02-03", sesi: 2, topik: "Ruang keadaan",
            pertanyaan: bi(
                "Pada masalah teko air berkapasitas 3 dan 5 liter, sasaran 4 liter dapat dicapai.",
                "In the water-jug problem with 3-litre and 5-litre jugs, a target of 4 litres is reachable."),
            bentuk: .benarSalah(benar: true),
            pembahasan: bi(
                "Menurut teorema Bézout, sasaran hanya bisa dicapai bila ia kelipatan pembagi bersama terbesar kedua kapasitas. FPB(3, 5) = 1, dan 4 kelipatan 1, jadi bisa. Memeriksanya di muka jauh lebih jujur daripada membiarkan pencarian berjalan lalu melaporkan “tidak ditemukan”.",
                "By Bézout's theorem, a target is reachable only if it is a multiple of the greatest common divisor of the two capacities. GCD(3, 5) = 1, and 4 is a multiple of 1, so it is. Checking that up front is far more honest than letting the search run and then reporting “not found”."),
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 3 — Certainty factor
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S03-01", sesi: 3, topik: "Certainty Factor",
            pertanyaan: bi(
                "Diketahui MB = 0,8 dan MD = 0,01. Berapa nilai CF-nya?",
                "Given MB = 0.8 and MD = 0.01, what is the CF?"),
            bentuk: angka((try? CertaintyFactor.dariMbMd(0.8, 0.01)) ?? 0),
            pembahasan: bi(
                "CF = MB − MD = 0,8 − 0,01 = 0,79. Ini soal Tugas Sesi 3 pada modul. Perhatikan MD ditulis positif; tanda negatifnya sudah ada di rumus.",
                "CF = MB − MD = 0.8 − 0.01 = 0.79. This is the Session 3 exercise from the course notes. Note that MD is written positive; the minus sign is already in the formula."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S03-02", sesi: 3, topik: "Certainty Factor",
            pertanyaan: bi(
                "Dua bukti masing-masing ber-CF 0,8 dan 0,6 mendukung hipotesis yang sama. Berapa CF gabungannya?",
                "Two pieces of evidence with CF 0.8 and 0.6 support the same hypothesis. What is the combined CF?"),
            bentuk: angka((try? CertaintyFactor.gabungParalel(0.8, 0.6)) ?? 0),
            pembahasan: bi(
                "Keduanya positif, jadi dipakai CF₁ + CF₂ × (1 − CF₁) = 0,8 + 0,6 × 0,2 = 0,92. Bukti kedua hanya menggarap sisa keyakinan yang belum terpakai; itulah sebabnya hasilnya tidak pernah melewati 1.",
                "Both are positive, so CF₁ + CF₂ × (1 − CF₁) = 0.8 + 0.6 × 0.2 = 0.92. The second piece works only on the belief the first has not already claimed, which is why the result never passes 1."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S03-03", sesi: 3, topik: "Certainty Factor",
            pertanyaan: bi(
                "Sebuah aturan ber-CF 0,9 dinyalakan bukti ber-CF −0,5. Berapa CF kesimpulannya?",
                "A rule with CF 0.9 is fired by evidence with CF −0.5. What is the CF of the conclusion?"),
            bentuk: angka((try? CertaintyFactor.gabungBerantai(0.9, -0.5)) ?? 0),
            pembahasan: bi(
                "Bukti dengan CF negatif tidak menyalakan aturan sama sekali, jadi hasilnya nol — bukan −0,45. Rumusnya CF_aturan × max(CF_bukti, 0).",
                "Evidence with a negative CF does not fire the rule at all, so the result is zero — not −0.45. The formula is CF_rule × max(CF_evidence, 0)."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S03-04", sesi: 3, topik: "Certainty Factor",
            pertanyaan: bi(
                "Nilai CF dapat ditafsirkan sebagai probabilitas hipotesis benar.",
                "A CF value can be read as the probability that the hypothesis is true."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "CF bukan probabilitas dan tidak memenuhi aturannya: CF sebuah hipotesis dan ingkarannya tidak harus berjumlah satu. Ia hanya bisa dibandingkan dengan CF lain di sistem yang sama.",
                "A CF is not a probability and does not obey the probability axioms: the CF of a hypothesis and of its negation need not sum to one. It can only be compared against other CFs in the same system."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S03-05", sesi: 3, topik: "Certainty Factor",
            pertanyaan: bi(
                "Dua premis ber-CF 0,9 dan 0,3 dihubungkan dengan DAN. Berapa CF premis gabungannya?",
                "Two premises with CF 0.9 and 0.3 are joined by AND. What is the CF of the combined premise?"),
            bentuk: angka((try? CertaintyFactor.premisDan(0.9, 0.3)) ?? 0),
            pembahasan: bi(
                "Premis DAN diambil nilai terkecilnya, yaitu 0,3. Alasannya sama seperti rantai: kekuatannya ditentukan mata rantai terlemah.",
                "An AND premise takes the smallest value, 0.3. The reasoning is the chain's: its strength is set by the weakest link."),
            tingkat: 1))

        // ------------------------------------------------------------------
        // Sesi 4 — Bayesian
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S04-01", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: bi(
                "20% berita adalah hoaks. 90% hoaks berjudul provokatif, dan 30% berita non-hoaks juga. Sebuah berita berjudul provokatif — berapa peluang ia hoaks?",
                "20% of articles are hoaxes. 90% of hoaxes carry a provocative headline, and so do 30% of non-hoaxes. An article has a provocative headline — how likely is it a hoax?"),
            bentuk: angka((try? Bayes.posterior(prior: 0.2, kemungkinanH: 0.9, kemungkinanBukanH: 0.3)) ?? 0),
            pembahasan: bi(
                "P(E) = 0,9×0,2 + 0,3×0,8 = 0,42. P(H|E) = 0,9×0,2 / 0,42 = 3/7 ≈ 0,4286. Ini soal Tugas Pertemuan 5. Perhatikan jawabannya di bawah setengah meski 90% hoaks berjudul provokatif — karena hoaksnya sendiri hanya 20%.",
                "P(E) = 0.9×0.2 + 0.3×0.8 = 0.42. P(H|E) = 0.9×0.2 / 0.42 = 3/7 ≈ 0.4286. This is the Session 5 exercise. Note the answer is below one half even though 90% of hoaxes carry such a headline — because hoaxes are only 20% to begin with."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S04-02", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: bi(
                "Dengan data soal sebelumnya, berapa P(E), yaitu peluang sebuah berita berjudul provokatif?",
                "With the data from the previous question, what is P(E) — the probability an article has a provocative headline?"),
            bentuk: angka((try? Bayes.bukti(prior: 0.2, kemungkinanH: 0.9, kemungkinanBukanH: 0.3)) ?? 0),
            pembahasan: bi(
                "P(E) = P(E|H)×P(H) + P(E|¬H)×P(¬H) = 0,9×0,2 + 0,3×0,8 = 0,18 + 0,24 = 0,42. Bukti bisa muncul lewat dua jalan, dan keduanya harus dijumlahkan.",
                "P(E) = P(E|H)×P(H) + P(E|¬H)×P(¬H) = 0.9×0.2 + 0.3×0.8 = 0.18 + 0.24 = 0.42. The evidence can arise by two routes, and both must be added."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S04-03", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: bi(
                "P(E|¬H) dapat dihitung sebagai 1 − P(E|H).",
                "P(E|¬H) can be computed as 1 − P(E|H)."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "Keduanya sama sekali tidak berhubungan: yang satu tentang kelompok yang hipotesisnya benar, yang lain tentang kelompok yang hipotesisnya salah. Keduanya harus diketahui terpisah, dan menukarnya adalah salah satu kekeliruan paling umum.",
                "The two are unrelated: one concerns the group for which the hypothesis holds, the other the group for which it does not. Both must be known separately, and confusing them is among the most common errors of all."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S04-04", sesi: 4, topik: "Teorema Bayes",
            pertanyaan: bi(
                "Sebuah penyakit menimpa 1 dari 1000 orang. Tesnya mendeteksi 99% yang sakit dan salah pada 5% yang sehat. Berapa peluang seseorang benar-benar sakit bila tesnya positif?",
                "A disease affects 1 in 1000 people. The test detects 99% of the ill and errs on 5% of the healthy. How likely is someone actually ill given a positive test?"),
            bentuk: angka((try? Bayes.posterior(prior: 0.001, kemungkinanH: 0.99, kemungkinanBukanH: 0.05)) ?? 0),
            pembahasan: bi(
                "Sekitar 0,0194 — di bawah 2 persen. Bukan tesnya yang buruk; priornya yang sangat kecil. Dari 1000 orang, sekitar 1 positif benar dan 50 positif palsu. Inilah kekeliruan mengabaikan laju dasar.",
                "About 0.0194 — under 2 per cent. The test is not bad; the prior is simply tiny. Among 1000 people there is roughly 1 true positive and 50 false ones. This is the base-rate fallacy."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S04-05", sesi: 4, topik: "Rasio kemungkinan",
            pertanyaan: bi(
                "Berapa rasio kemungkinan bila P(E|H) = 0,9 dan P(E|¬H) = 0,3?",
                "What is the likelihood ratio when P(E|H) = 0.9 and P(E|¬H) = 0.3?"),
            bentuk: angka((try? Bayes.rasioKemungkinan(0.9, 0.3)) ?? 0),
            pembahasan: bi(
                "LR = 0,9 / 0,3 = 3. Rasio kemungkinan tidak bergantung prior sama sekali, sehingga ia mengukur kekuatan bukti itu sendiri. Nilai 1 berarti buktinya tidak memberi tahu apa pun.",
                "LR = 0.9 / 0.3 = 3. The likelihood ratio does not depend on the prior at all, so it measures the strength of the evidence itself. A value of 1 means the evidence tells you nothing."),
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 5–6 — Logika fuzzy
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S05-01", sesi: 5, topik: "Keanggotaan kabur",
            pertanyaan: bi(
                "Himpunan segitiga (0, 5, 10). Berapa derajat keanggotaan x = 2,5?",
                "A triangular set (0, 5, 10). What is the degree of membership at x = 2.5?"),
            bentuk: angka(Kabur.segitiga(0, 5, 10, 2.5)),
            pembahasan: bi(
                "x berada di kaki kiri, jadi μ = (x − a)/(b − a) = 2,5/5 = 0,5. Setengah jalan menuju puncak berarti derajat keanggotaan setengah.",
                "x sits on the left leg, so μ = (x − a)/(b − a) = 2.5/5 = 0.5. Halfway to the peak means a membership of one half."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S05-02", sesi: 5, topik: "Keanggotaan kabur",
            pertanyaan: bi(
                "Himpunan trapesium (5, 8, 10, 10). Berapa derajat keanggotaan x = 10?",
                "A trapezoidal set (5, 8, 10, 10). What is the degree of membership at x = 10?"),
            bentuk: angka(Kabur.trapesium(5, 8, 10, 10, 10)),
            pembahasan: bi(
                "Jawabannya 1, bukan 0. Bahu datarnya membentang dari 8 sampai 10, dan x = 10 masih di dalamnya. Inilah bentuk yang paling sering salah dihitung: himpunan berkaki berimpit di tepi semesta.",
                "The answer is 1, not 0. The flat shoulder runs from 8 to 10, and x = 10 is still inside it. This is the shape most often got wrong: a set with a coincident leg at the edge of the universe."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S05-03", sesi: 5, topik: "Derajat keanggotaan",
            pertanyaan: bi(
                "Derajat keanggotaan seluruh himpunan kabur pada satu nilai harus berjumlah satu.",
                "The degrees of membership across all fuzzy sets at one value must sum to one."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "Itu berlaku untuk probabilitas, bukan untuk derajat keanggotaan. Suhu 26 derajat bisa “sejuk” sebesar 0,4 dan “hangat” sebesar 0,7 sekaligus; jumlahnya 1,1 dan itu sah.",
                "That holds for probabilities, not for memberships. A temperature of 26 degrees can be “cool” to degree 0.4 and “warm” to degree 0.7 at once; they sum to 1.1, and that is perfectly valid."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S06-01", sesi: 6, topik: "Inferensi kabur",
            pertanyaan: bi(
                "Aturan berpremis “A DAN B” dengan derajat 0,7 dan 0,4. Berapa kekuatan penyalaannya?",
                "A rule with premises “A AND B” at degrees 0.7 and 0.4. What is its firing strength?"),
            bentuk: angka(min(0.7, 0.4)),
            pembahasan: bi(
                "Premis DAN diambil minimumnya, yaitu 0,4. Aturan hanya sekuat premis terlemahnya, persis seperti rantai yang putus di mata rantai terlemah.",
                "An AND premise takes the minimum, 0.4. A rule is only as strong as its weakest premise, exactly like a chain breaking at its weakest link."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S06-02", sesi: 6, topik: "Defuzzifikasi",
            pertanyaan: bi(
                "Metode defuzzifikasi mana yang tidak perlu menggambar kurva keluaran sama sekali?",
                "Which defuzzification method never has to draw the output curve at all?"),
            bentuk: .pilihan(pilihan: [
                bi("Sugeno", "Sugeno"),
                bi("Mamdani", "Mamdani"),
                bi("Centroid", "Centroid"),
                bi("Mean of Maximum", "Mean of Maximum"),
            ], benar: 0),
            pembahasan: bi(
                "Sugeno langsung memakai satu angka per aturan, sehingga jauh lebih murah dihitung. Itulah alasan ia lebih sering dipakai di sistem kendali tertanam, sementara Mamdani dipakai ketika bentuk keluarannya perlu ditafsirkan manusia.",
                "Sugeno uses one number per rule directly, which makes it far cheaper. That is why it is the more common choice in embedded control, while Mamdani is used when the shape of the output has to be interpreted by a person."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S06-03", sesi: 6, topik: "Defuzzifikasi",
            pertanyaan: bi(
                "Mamdani, Sugeno, dan Tsukamoto akan memberi jawaban yang sama bila aturannya sama.",
                "Mamdani, Sugeno, and Tsukamoto give the same answer when the rules are the same."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "Aturannya hanya menentukan kekuatan penyalaan; yang berbeda adalah cara mengubah kekuatan itu menjadi satu angka. Perbedaan hasilnya bukan kesalahan melainkan konsekuensi definisi masing-masing.",
                "The rules only fix the firing strengths; what differs is how those strengths become one number. The difference is not an error but a consequence of each definition."),
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 7 — Representasi pengetahuan
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S07-01", sesi: 7, topik: "Tabel kebenaran",
            pertanyaan: bi(
                "Berapa baris tabel kebenaran untuk rumus dengan 5 proposisi?",
                "How many rows does a truth table have for a formula with 5 propositions?"),
            bentuk: angka(32),
            pembahasan: bi(
                "2⁵ = 32. Tiap proposisi baru melipatduakan barisnya, sehingga sepuluh proposisi sudah berarti 1.024 baris — dan itulah alasan pembuktian yang tidak perlu memeriksa semua baris jauh lebih berharga.",
                "2⁵ = 32. Each new proposition doubles the rows, so ten propositions already mean 1,024 — which is why a proof that avoids checking every row is worth so much more."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S07-02", sesi: 7, topik: "Resolusi",
            pertanyaan: bi(
                "Pembuktian dengan resolusi bekerja dengan cara…",
                "Proof by resolution works by…"),
            bentuk: .pilihan(pilihan: [
                bi("menyangkal kesimpulan lalu mencari kontradiksi",
                   "negating the conclusion and then looking for a contradiction"),
                bi("mencoba seluruh kemungkinan nilai kebenaran",
                   "trying every possible assignment of truth values"),
                bi("menghitung peluang kesimpulan benar",
                   "computing how likely the conclusion is to be true"),
                bi("menyusun tabel kebenaran yang lebih ringkas",
                   "building a more compact truth table"),
            ], benar: 0),
            pembahasan: bi(
                "Resolusi menambahkan ingkaran kesimpulan ke basis pengetahuan lalu mencari klausa kosong. Kalau klausa kosong ditemukan, ingkarannya mustahil benar — jadi kesimpulannya pasti mengikuti.",
                "Resolution adds the negated conclusion to the knowledge base and searches for the empty clause. If the empty clause turns up, the negation cannot hold — so the conclusion must follow."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S07-03", sesi: 7, topik: "Jaringan semantik",
            pertanyaan: bi(
                "Pada jaringan semantik, sifat yang dituliskan pada simpul induk berlaku juga bagi seluruh turunannya.",
                "In a semantic network, a property written on a parent node also holds for all of its descendants."),
            bentuk: .benarSalah(benar: true),
            pembahasan: bi(
                "Itulah gunanya jaringan semantik: menuliskan bahwa hewan punya sel satu kali sudah cukup untuk seluruh turunannya. Pengecualian ditangani dengan menuliskan sifat yang berbeda langsung pada simpul turunannya.",
                "That is the point of a semantic network: writing once that animals have cells is enough for every descendant. Exceptions are handled by writing the differing property directly on the descendant node."),
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 8 — Pencarian
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S08-01", sesi: 8, topik: "Pencarian",
            pertanyaan: bi(
                "Algoritma A* dijamin menemukan jalur terpendek bila heuristiknya…",
                "A* is guaranteed to find the shortest path when its heuristic…"),
            bentuk: .pilihan(pilihan: [
                bi("tidak pernah menaksir lebih besar daripada biaya sebenarnya",
                   "never overestimates the true remaining cost"),
                bi("selalu menaksir tepat sama dengan biaya sebenarnya",
                   "always estimates exactly the true remaining cost"),
                bi("selalu bernilai nol", "is always zero"),
                bi("menaksir lebih besar agar pencariannya lebih cepat",
                   "overestimates in order to search faster"),
            ], benar: 0),
            pembahasan: bi(
                "Heuristik yang tidak pernah menaksir berlebihan disebut admissible. Heuristik yang menaksir berlebihan bisa membuat A* melewatkan jalur terpendek — ia jadi lebih cepat tetapi berhenti menjamin apa pun.",
                "A heuristic that never overestimates is called admissible. One that does overestimate can make A* miss the shortest path — it becomes faster but stops guaranteeing anything."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S08-02", sesi: 8, topik: "Pencarian",
            pertanyaan: bi(
                "Manakah yang benar tentang BFS dan DFS pada graf berbobot seragam?",
                "Which is true of BFS and DFS on a uniformly weighted graph?"),
            bentuk: .pilihan(pilihan: [
                bi("BFS menjamin jalur terpendek, DFS tidak",
                   "BFS guarantees the shortest path, DFS does not"),
                bi("keduanya menjamin jalur terpendek", "both guarantee the shortest path"),
                bi("DFS menjamin jalur terpendek, BFS tidak",
                   "DFS guarantees the shortest path, BFS does not"),
                bi("keduanya tidak menjamin apa pun", "neither guarantees anything"),
            ], benar: 0),
            pembahasan: bi(
                "BFS menelusuri lapis demi lapis, jadi simpul tujuan pertama yang ditemuinya pasti yang terdekat. DFS menelusuri sedalam mungkin lebih dulu dan bisa menemukan jalur panjang yang berputar-putar.",
                "BFS explores layer by layer, so the first goal node it meets must be the nearest. DFS goes as deep as it can first and may find a long, winding path."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S08-03", sesi: 8, topik: "Heuristik",
            pertanyaan: bi(
                "Jarak Manhattan dari (2, 3) ke (7, 8) adalah berapa?",
                "What is the Manhattan distance from (2, 3) to (7, 8)?"),
            bentuk: angka(Ml.manhattan([2, 3], [7, 8])),
            pembahasan: bi(
                "|7−2| + |8−3| = 5 + 5 = 10. Jarak Manhattan dipakai sebagai heuristik pada peta berpetak yang gerakannya hanya empat arah, karena di sana ia tidak pernah menaksir berlebihan.",
                "|7−2| + |8−3| = 5 + 5 = 10. Manhattan distance is used as a heuristic on grid maps with four-way movement, because there it never overestimates."),
            tingkat: 1))

        // ------------------------------------------------------------------
        // Sesi 9 — Jaringan syaraf
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S09-01", sesi: 9, topik: "Perceptron",
            pertanyaan: bi(
                "Perceptron satu lapis dapat memisahkan fungsi XOR.",
                "A single-layer perceptron can separate the XOR function."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "XOR tidak terpisahkan secara linear, dan perceptron satu lapis hanya bisa menarik satu garis lurus. Temuan Minsky dan Papert tentang ini menghentikan penelitian jaringan syaraf hampir dua dekade, sampai perambatan balik ditemukan.",
                "XOR is not linearly separable, and a single-layer perceptron can only draw one straight line. Minsky and Papert's finding on this halted neural-network research for nearly two decades, until backpropagation arrived."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S09-02", sesi: 9, topik: "Pelatihan",
            pertanyaan: bi(
                "Apa yang terjadi bila laju belajar disetel terlalu besar?",
                "What happens when the learning rate is set too high?"),
            bentuk: .pilihan(pilihan: [
                bi("galat berhenti menurun lalu melompat-lompat tanpa mengecil",
                   "the error stops falling and bounces around without shrinking"),
                bi("pelatihan menjadi lebih cepat tanpa efek samping",
                   "training simply goes faster with no side effects"),
                bi("jaringan pasti berhenti belajar sama sekali",
                   "the network certainly stops learning altogether"),
                bi("galat menurun lebih halus daripada biasanya",
                   "the error falls more smoothly than usual"),
            ], benar: 0),
            pembahasan: bi(
                "Langkah yang terlalu besar melewati titik terendah lalu memantul ke sisi seberang. Cirinya khas: kurva galatnya berayun dan tidak pernah mengecil, berbeda dari laju yang terlalu kecil yang menurun tetapi sangat lambat.",
                "Too large a step overshoots the minimum and bounces to the far side. The signature is distinctive: the error curve oscillates and never shrinks — unlike too small a rate, which falls but very slowly."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S09-03", sesi: 9, topik: "Fungsi aktivasi",
            pertanyaan: bi(
                "Berapa nilai fungsi sigmoid pada masukan 0?",
                "What is the value of the sigmoid function at input 0?"),
            bentuk: angka(Kabur.sigmoid(1, 0, 0)),
            pembahasan: bi(
                "σ(0) = 1/(1 + e⁰) = 1/2 = 0,5. Sigmoid selalu bernilai setengah tepat di titik tengahnya, dan itulah sebabnya ia dipakai sebagai penggolong dua kelas dengan ambang 0,5.",
                "σ(0) = 1/(1 + e⁰) = 1/2 = 0.5. The sigmoid is always one half exactly at its midpoint, which is why it serves as a two-class classifier with a threshold of 0.5."),
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 10 — NLP
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S10-01", sesi: 10, topik: "Stemming",
            pertanyaan: bi(
                "Kata dasar dari “menyapu” adalah…",
                "The root of the Indonesian word “menyapu” (to sweep) is…"),
            bentuk: .pilihan(pilihan: [
                bi("sapu", "sapu"),
                bi("nyapu", "nyapu"),
                bi("menyapu", "menyapu"),
                bi("apu", "apu"),
            ], benar: 0),
            pembahasan: bi(
                "Awalan meny- meluluhkan huruf s pada kata dasarnya, sehingga “menyapu” berasal dari “sapu”, bukan “nyapu”. Tidak ada algoritma stemming Bahasa Inggris yang mengetahui aturan peluluhan ini.",
                "The prefix meny- absorbs the initial s of the root, so “menyapu” comes from “sapu”, not “nyapu”. No English stemming algorithm knows this assimilation rule."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S10-02", sesi: 10, topik: "Stemming",
            pertanyaan: bi(
                "Kenapa pencari kata dasar Bahasa Indonesia perlu memeriksa kamus sebelum mengupas imbuhan?",
                "Why must an Indonesian stemmer check a dictionary before stripping affixes?"),
            bentuk: .pilihan(pilihan: [
                bi("agar kata seperti “beruang” tidak dikupas menjadi “uang”",
                   "so that a word like “beruang” (bear) is not stripped down to “uang” (money)"),
                bi("agar prosesnya berjalan lebih cepat", "so that the process runs faster"),
                bi("agar hasilnya selalu berupa kata benda", "so that the result is always a noun"),
                bi("agar imbuhan yang dikupas bisa dikembalikan",
                   "so that stripped affixes can be restored"),
            ], benar: 0),
            pembahasan: bi(
                "“Beruang” sudah ada di kamus, jadi pengupasan harus berhenti. Tanpa pemeriksaan itu, aturan pengupasan akan tetap berjalan dan menghasilkan “uang” — kata yang sah tetapi maknanya sama sekali lain.",
                "“Beruang” is already in the dictionary, so stripping must stop. Without that check the rules keep going and produce “uang” — a valid word with an entirely different meaning."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S10-03", sesi: 10, topik: "TF-IDF",
            pertanyaan: bi(
                "Kata yang muncul di seluruh dokumen akan mendapat bobot IDF yang tinggi.",
                "A word appearing in every document receives a high IDF weight."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "Sebaliknya: IDF-nya paling rendah. Kata yang muncul di mana-mana tidak membedakan apa pun, dan itulah seluruh gagasan TF-IDF — yang sering muncul di semua tempat justru tidak informatif.",
                "The opposite: its IDF is the lowest possible. A word that appears everywhere distinguishes nothing, and that is the whole idea of TF-IDF — what is common everywhere carries no information."),
            tingkat: 2))

        // ------------------------------------------------------------------
        // Sesi 11 — Sistem pakar
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S11-01", sesi: 11, topik: "Sistem pakar",
            pertanyaan: bi(
                "Runut maju (forward chaining) menjawab pertanyaan…",
                "Forward chaining answers the question…"),
            bentuk: .pilihan(pilihan: [
                bi("apa yang bisa disimpulkan dari fakta yang ada",
                   "what can be concluded from the facts on hand"),
                bi("benarkah dugaan tertentu ini", "is this particular hypothesis true"),
                bi("berapa peluang kesimpulan benar",
                   "how likely the conclusion is to be true"),
                bi("aturan mana yang paling sering dipakai",
                   "which rule is used most often"),
            ], benar: 0),
            pembahasan: bi(
                "Runut maju berangkat dari fakta menuju kesimpulan; runut mundur berangkat dari dugaan lalu mencari bukti pendukungnya. Keduanya memakai basis aturan yang sama persis, hanya arah penelusurannya berbeda.",
                "Forward chaining runs from facts to conclusions; backward chaining starts from a hypothesis and looks for supporting evidence. Both use exactly the same rule base; only the direction of travel differs."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S11-02", sesi: 11, topik: "Sistem pakar",
            pertanyaan: bi(
                "Fasilitas penjelasan pada sistem pakar berguna untuk…",
                "The explanation facility in an expert system exists to…"),
            bentuk: .pilihan(pilihan: [
                bi("menunjukkan aturan mana yang dipakai sehingga kesimpulannya bisa diperiksa",
                   "show which rules were used so the conclusion can be checked"),
                bi("mempercepat proses inferensi", "speed up the inference process"),
                bi("menghemat memori basis pengetahuan",
                   "save memory in the knowledge base"),
                bi("menggantikan peran pakar sepenuhnya",
                   "replace the expert entirely"),
            ], benar: 0),
            pembahasan: bi(
                "Sistem pakar yang tidak bisa menjawab “kenapa” hanyalah tebakan bercangkang komputer. Fasilitas penjelasan bukan hiasan; ia yang membuat kesimpulannya bisa dipertanggungjawabkan.",
                "An expert system that cannot answer “why” is only a guess in a computer's shell. The explanation facility is not decoration; it is what makes the conclusion answerable for."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S11-03", sesi: 11, topik: "Basis pengetahuan",
            pertanyaan: bi(
                "Sebuah fakta yang dipakai sebagai premis tetapi tidak bisa disimpulkan maupun ditanyakan akan menyebabkan galat saat sistem dijalankan.",
                "A fact used as a premise but which can be neither inferred nor asked will raise an error when the system runs."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "Justru tidak — dan di situlah bahayanya. Fakta seperti itu diam-diam dianggap tidak berlaku, sehingga aturannya tidak pernah menyala dan tidak ada pesan galat apa pun. Ini jenis cacat yang paling sulit ditemukan pada sistem pakar.",
                "It will not — and that is exactly the danger. Such a fact is quietly treated as false, so its rule never fires and no error appears at all. This is the hardest class of defect to find in an expert system."),
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 12–13 — Data dan pembelajaran mesin
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S12-01", sesi: 12, topik: "Big data",
            pertanyaan: bi(
                "Manakah yang bukan bagian dari “tiga V” pada big data?",
                "Which is not one of the “three Vs” of big data?"),
            bentuk: .pilihan(pilihan: [
                bi("Validity", "Validity"),
                bi("Volume", "Volume"),
                bi("Velocity", "Velocity"),
                bi("Variety", "Variety"),
            ], benar: 0),
            pembahasan: bi(
                "Tiga V aslinya adalah Volume, Velocity, dan Variety. Veracity sering ditambahkan sebagai V keempat, tetapi Validity bukan bagian dari kerangka aslinya.",
                "The original three Vs are Volume, Velocity, and Variety. Veracity is often added as a fourth, but Validity was never part of the original framing."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-01", sesi: 13, topik: "Entropi",
            pertanyaan: bi(
                "Berapa entropi sebuah himpunan berisi dua kelas yang jumlahnya berimbang sempurna?",
                "What is the entropy of a set holding two perfectly balanced classes?"),
            bentuk: angka(Ml.entropi(["A", "B"])),
            pembahasan: bi(
                "Tepat 1 bit. Entropi mengukur berapa banyak pertanyaan ya-tidak yang dibutuhkan untuk memastikan jawabannya, dan dua kelas berimbang butuh tepat satu pertanyaan.",
                "Exactly 1 bit. Entropy measures how many yes-or-no questions are needed to pin down the answer, and two balanced classes need exactly one."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-02", sesi: 13, topik: "Entropi",
            pertanyaan: bi(
                "Berapa entropi himpunan yang seluruh anggotanya satu kelas?",
                "What is the entropy of a set whose members all share one class?"),
            bentuk: angka(0),
            pembahasan: bi(
                "Nol. Tidak ada ketidakpastian sama sekali, jadi tidak ada pertanyaan yang perlu diajukan. Inilah keadaan yang dicari ID3 saat membentuk daun.",
                "Zero. There is no uncertainty at all, so no question needs asking. This is the state ID3 is looking for when it forms a leaf."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-03", sesi: 13, topik: "Ketakmurnian Gini",
            pertanyaan: bi(
                "Berapa ketakmurnian Gini himpunan berisi dua kelas berimbang?",
                "What is the Gini impurity of a set with two balanced classes?"),
            bentuk: angka(Ml.gini(["A", "B"])),
            pembahasan: bi(
                "1 − (0,5² + 0,5²) = 0,5. Berbeda dengan entropi yang bernilai 1 pada keadaan yang sama, karena keduanya memakai skala yang berbeda. Gini lebih murah dihitung karena tidak memakai logaritma.",
                "1 − (0.5² + 0.5²) = 0.5. Different from entropy, which is 1 in the same situation, because the two use different scales. Gini is cheaper because it uses no logarithm."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S13-04", sesi: 13, topik: "Pohon keputusan",
            pertanyaan: bi(
                "ID3 memilih atribut pemecah berdasarkan…",
                "ID3 chooses its splitting attribute by…"),
            bentuk: .pilihan(pilihan: [
                bi("perolehan informasi tertinggi", "the highest information gain"),
                bi("jumlah nilai berbeda terbanyak", "the largest number of distinct values"),
                bi("urutan kolom pada data", "the column order in the data"),
                bi("ketakmurnian Gini tertinggi", "the highest Gini impurity"),
            ], benar: 0),
            pembahasan: bi(
                "Perolehan informasi tertinggi, yaitu yang paling banyak mengurangi ketidakpastian. Memilih menurut jumlah nilai terbanyak justru jebakan: kolom beridentitas unik memberi perolehan maksimum padahal tidak meramalkan apa pun.",
                "The highest information gain — the attribute that removes the most uncertainty. Choosing by the number of distinct values is a trap: an identifier column yields maximum gain while predicting nothing."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S13-05", sesi: 13, topik: "kNN",
            pertanyaan: bi(
                "Berapa jarak Euclidean antara titik (0, 0) dan (3, 4)?",
                "What is the Euclidean distance between (0, 0) and (3, 4)?"),
            bentuk: angka(Ml.euclidean([0, 0], [3, 4])),
            pembahasan: bi(
                "√(3² + 4²) = √25 = 5. Segitiga siku-siku 3-4-5 yang paling terkenal. Jarak Euclidean hanya memakai operasi yang dibulatkan tepat menurut IEEE-754, sehingga hasilnya identik di bahasa mana pun.",
                "√(3² + 4²) = √25 = 5 — the most famous right triangle of all. Euclidean distance uses only operations IEEE-754 requires to be correctly rounded, so the result is identical in any language."),
            tingkat: 1))

        soal.append(Soal(
            kode: "S13-06", sesi: 13, topik: "kNN",
            pertanyaan: bi(
                "Kenapa k ganjil lebih disukai pada kNN dengan dua kelas?",
                "Why is an odd k preferred for kNN with two classes?"),
            bentuk: .pilihan(pilihan: [
                bi("agar suaranya tidak pernah imbang", "so the vote can never tie"),
                bi("agar perhitungannya lebih cepat", "so the computation runs faster"),
                bi("agar jaraknya lebih akurat", "so the distances are more accurate"),
                bi("agar tidak perlu menyamakan skala fitur",
                   "so the features need not be put on a common scale"),
            ], benar: 0),
            pembahasan: bi(
                "Dengan k genap pada dua kelas, suaranya bisa imbang dan pemecah serinya menjadi sewenang-wenang. k ganjil menjamin selalu ada pemenang.",
                "With an even k over two classes the vote can tie, and the tie-break becomes arbitrary. An odd k guarantees a winner."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S13-07", sesi: 13, topik: "k-means",
            pertanyaan: bi(
                "Inersia dapat dipakai untuk memilih jumlah kelompok k yang terbaik.",
                "Inertia can be used to choose the best number of clusters k."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "Inersia selalu turun saat k dinaikkan, dan mencapai nol ketika k sama dengan jumlah data. Yang dicari adalah titik sikunya pada grafik, bukan nilai terkecilnya.",
                "Inertia always falls as k rises, reaching zero when k equals the number of points. What you look for is the elbow on the graph, not the smallest value."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S13-08", sesi: 13, topik: "Evaluasi",
            pertanyaan: bi(
                "Sebuah model berketepatan 95% pada data yang 95% anggotanya satu kelas. Apa artinya?",
                "A model is 95% accurate on data in which 95% of rows share one class. What does that mean?"),
            bentuk: .pilihan(pilihan: [
                bi("modelnya belum tentu mempelajari apa pun; menebak kelas mayoritas memberi hasil sama",
                   "the model may have learned nothing; guessing the majority class scores the same"),
                bi("modelnya sangat baik", "the model is very good"),
                bi("modelnya mengalami overfitting", "the model is overfitting"),
                bi("datanya terlalu sedikit", "there is too little data"),
            ], benar: 0),
            pembahasan: bi(
                "Ketepatan harus selalu dibandingkan dengan tebakan kelas terbanyak. Ketepatan yang tidak melampaui tebakan bukanlah pembelajaran, meski angkanya terlihat tinggi.",
                "Accuracy must always be compared against guessing the majority class. Accuracy that does not beat the guess is not learning, however high the number looks."),
            tingkat: 3))

        // ------------------------------------------------------------------
        // Sesi 14 — Robotika
        // ------------------------------------------------------------------

        soal.append(Soal(
            kode: "S14-01", sesi: 14, topik: "Kendali PID",
            pertanyaan: bi(
                "Bagian mana dari kendali PID yang menghilangkan galat tunak?",
                "Which part of a PID controller removes steady-state error?"),
            bentuk: .pilihan(pilihan: [
                bi("Integral", "Integral"),
                bi("Proporsional", "Proportional"),
                bi("Derivatif", "Derivative"),
                bi("ketiganya sama", "all three equally"),
            ], benar: 0),
            pembahasan: bi(
                "Bagian integral menumpuk galat sepanjang waktu, sehingga galat kecil yang menetap pun akhirnya menghasilkan koreksi. Bagian proporsional sendirian selalu menyisakan galat tunak.",
                "The integral term accumulates error over time, so even a small persistent error eventually produces a correction. The proportional term alone always leaves a steady-state error behind."),
            tingkat: 3))

        soal.append(Soal(
            kode: "S14-02", sesi: 14, topik: "Kinematika",
            pertanyaan: bi(
                "Kinematika maju pada lengan robot menghitung…",
                "Forward kinematics on a robot arm computes…"),
            bentuk: .pilihan(pilihan: [
                bi("posisi ujung lengan dari sudut tiap sendinya",
                   "the position of the end effector from each joint angle"),
                bi("sudut sendi yang dibutuhkan untuk mencapai posisi tertentu",
                   "the joint angles needed to reach a given position"),
                bi("gaya yang dibutuhkan tiap sendi",
                   "the force required at each joint"),
                bi("lintasan tercepat menuju sasaran",
                   "the fastest path to the target"),
            ], benar: 0),
            pembahasan: bi(
                "Kinematika maju: dari sudut ke posisi, dan jawabannya selalu tunggal. Kinematika balik sebaliknya, dan jawabannya bisa lebih dari satu atau tidak ada sama sekali.",
                "Forward kinematics goes from angles to position, and its answer is always unique. Inverse kinematics goes the other way, and may have several answers or none at all."),
            tingkat: 2))

        soal.append(Soal(
            kode: "S14-03", sesi: 14, topik: "Kendali PID",
            pertanyaan: bi(
                "Menaikkan penguatan proporsional selalu membuat sistem lebih stabil.",
                "Raising the proportional gain always makes the system more stable."),
            bentuk: .benarSalah(benar: false),
            pembahasan: bi(
                "Sebaliknya. Penguatan proporsional yang terlalu besar membuat sistem berayun dan akhirnya tidak stabil. Yang membuatnya stabil bukan penguatan yang besar melainkan yang seimbang antara ketiga bagiannya.",
                "The opposite. Too much proportional gain makes the system oscillate and eventually go unstable. What brings stability is not a large gain but a balanced one across all three terms."),
            tingkat: 2))

        return soal
    }
}
