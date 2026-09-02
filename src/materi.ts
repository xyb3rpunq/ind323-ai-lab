/**
 * Ringkasan materi tiap sesi kuliah, dalam dua bahasa.
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
 * # Kenapa pasangan `bi(...)`, bukan dua berkas terpisah
 *
 * Karena kedua bahasa ditulis di baris yang sama, sehingga tidak mungkin
 * menyunting salah satunya tanpa melihat yang lain. Dua berkas terpisah selalu
 * berakhir sama: yang satu diperbaiki, yang lain tidak, dan yang tertinggal
 * adalah bahasa yang tidak dipakai penulisnya sehari-hari.
 *
 * # Catatan tentang terjemahannya
 *
 * `ekspresi` rumus tidak diterjemahkan: notasi matematika sudah sama di kedua
 * bahasa, dan "menerjemahkannya" hanya akan menghasilkan dua salinan yang bisa
 * menyimpang tanpa alasan.
 *
 * .Deckyx
 */

import { bi, type Bilingual } from "./i18n";

export interface Rumus {
  nama: Bilingual;
  /** Tidak diterjemahkan; notasi matematika sama di kedua bahasa. */
  ekspresi: string;
}

export interface Materi {
  sesi: number;
  judul: Bilingual;
  /** Gagasan pokok sesi ini, satu paragraf. */
  inti: Bilingual;
  /** Kekeliruan yang paling sering muncul. */
  keliru: Bilingual;
  /** Bentuk pertanyaan yang biasanya keluar. */
  diuji: Bilingual;
  rumus: Rumus[];
}

export const MATERI: Materi[] = [
  {
    sesi: 1,
    judul: bi("Pengantar Kecerdasan Buatan", "Introduction to Artificial Intelligence"),
    inti: bi(
      "Turing mengganti pertanyaan “apakah mesin bisa berpikir” — yang tidak bisa diuji — dengan pertanyaan yang bisa: apakah penanya bisa membedakannya. ELIZA lalu menunjukkan betapa tipis ambang itu: seratus baris aturan pencocokan kata kunci sudah cukup membuat orang merasa dipahami.",
      "Turing replaced the question “can machines think” — which cannot be tested — with one that can: can an interrogator tell the difference. ELIZA then showed how thin that threshold is: a hundred lines of keyword-matching rules were enough to make people feel understood.",
    ),
    keliru: bi(
      "Menganggap ELIZA punya pemahaman sekecil apa pun. Ia hanya mencocokkan kata kunci lalu memantulkan potongan kalimat dengan kata ganti ditukar. Yang menarik justru kesenjangannya: mesin yang sesederhana itu menghasilkan kesan yang sekuat itu, dan kesan itu datang dari manusia yang menilai, bukan dari mesinnya.",
      "Believing ELIZA had any understanding at all. It merely matched keywords and reflected fragments back with the pronouns swapped. The interesting part is the gap: a machine that simple produced an impression that strong, and the impression came from the human doing the judging, not from the machine.",
    ),
    diuji: bi(
      "Definisi uji Turing dan apa yang bukan bagian darinya, cara kerja ELIZA, dan istilah “efek ELIZA”. Hampir selalu berupa pilihan ganda atau benar-salah, jarang berhitung.",
      "The definition of the Turing test and what is not part of it, how ELIZA works, and the term “ELIZA effect”. Almost always multiple choice or true/false, rarely calculation.",
    ),
    rumus: [],
  },
  {
    sesi: 2,
    judul: bi("Agen Cerdas dan Ruang Keadaan", "Intelligent Agents and State Space"),
    inti: bi(
      "Yang membedakan keempat jenis agen bukan kecanggihan melainkan seberapa banyak yang mereka ingat. Agen refleks sederhana tidak punya cara mengetahui bahwa pekerjaannya sudah selesai, jadi ia terus bergerak sampai dihentikan paksa — dan itulah sebabnya biayanya hampir selalu paling besar meski aturannya tidak salah.",
      "What separates the four agent types is not sophistication but how much they remember. A simple reflex agent has no way of knowing its work is done, so it keeps moving until forcibly stopped — which is why its cost is almost always the highest even though its rules are not wrong.",
    ),
    keliru: bi(
      "Mengira PEAS hanya daftar istilah yang perlu dihafal. Ukuran keberhasilan diletakkan pertama karena ia yang menentukan sisanya: agen yang dinilai dari kebersihan berperilaku sama sekali berbeda dari agen yang dinilai dari hemat energi, meski lingkungan dan sensornya sama persis.",
      "Treating PEAS as a list of terms to memorise. The performance measure comes first because it determines everything else: an agent judged on cleanliness behaves entirely differently from one judged on energy use, even with identical environments and sensors.",
    ),
    diuji: bi(
      "Membedakan keempat jenis agen, menguraikan PEAS sebuah masalah, dan keterjangkauan pada masalah teko air. Yang terakhir sering dikira harus dicoba satu per satu, padahal teorema Bézout menjawabnya seketika.",
      "Distinguishing the four agent types, laying out the PEAS of a problem, and reachability in the water-jug problem. The last is often assumed to require trial and error, when Bézout's theorem answers it immediately.",
    ),
    rumus: [
      {
        nama: bi("Keterjangkauan teko air", "Water-jug reachability"),
        ekspresi: "sasaran dapat dicapai ⟺ sasaran kelipatan FPB(a, b)",
      },
    ],
  },
  {
    sesi: 3,
    judul: bi("Ketidakpastian dan Certainty Factor", "Uncertainty and Certainty Factors"),
    inti: bi(
      "MYCIN lahir dari masalah nyata: dokter tidak pernah berkata “pasti”. CF mengubah “kemungkinan besar” menjadi satu angka antara −1 dan +1, lalu menyediakan cara menggabungkan beberapa angka seperti itu tanpa perlu tahu peluang sebenarnya — yang justru hampir tidak pernah tersedia.",
      "MYCIN grew out of a real problem: physicians never say “certainly”. A certainty factor turns “most likely” into a single number between −1 and +1, then provides a way to combine several such numbers without knowing the true probabilities — which are almost never available anyway.",
    ),
    keliru: bi(
      "Menganggap CF sebagai probabilitas. CF sebuah hipotesis dan ingkarannya tidak harus berjumlah satu, jadi menjumlahkannya seperti peluang menghasilkan angka yang tidak berarti apa-apa. Kekeliruan kedua: memakai rumus penggabungan tanpa memeriksa tanda kedua CF lebih dulu — ada tiga cabang, dan yang menentukan cabangnya adalah tandanya.",
      "Treating a CF as a probability. The CF of a hypothesis and of its negation need not sum to one, so adding them like probabilities yields a meaningless number. A second mistake: applying the combination formula without first checking the signs of both CFs — there are three branches, and the sign is what selects between them.",
    ),
    diuji: bi(
      "Menghitung CF dari MB dan MD, menggabungkan dua sampai tiga bukti, dan menentukan CF kesimpulan dari CF aturan. Yang sering menjebak: bukti ber-CF negatif pada penggabungan berantai menghasilkan nol, bukan nilai negatif.",
      "Computing CF from MB and MD, combining two or three pieces of evidence, and deriving a conclusion's CF from a rule's CF. The common trap: negative-CF evidence in sequential combination yields zero, not a negative value.",
    ),
    rumus: [
      { nama: bi("CF dari MB dan MD", "CF from MB and MD"), ekspresi: "CF = MB − MD" },
      { nama: bi("Dua CF positif", "Two positive CFs"), ekspresi: "CF₁ + CF₂ × (1 − CF₁)" },
      { nama: bi("Dua CF negatif", "Two negative CFs"), ekspresi: "CF₁ + CF₂ × (1 + CF₁)" },
      {
        nama: bi("Tanda berlawanan", "Opposite signs"),
        ekspresi: "(CF₁ + CF₂) / (1 − min(|CF₁|, |CF₂|))",
      },
      { nama: bi("Berantai", "Sequential"), ekspresi: "CF_aturan × max(CF_premis, 0)" },
    ],
  },
  {
    sesi: 4,
    judul: bi("Probabilitas Bayesian", "Bayesian Probability"),
    inti: bi(
      "Teorema Bayes membalik arah pertanyaan: dari “seberapa sering gejala muncul pada yang sakit” menjadi “seberapa mungkin sakit bila gejalanya muncul”. Pembalikan itu tampak sepele di rumus tetapi hampir selalu keliru di kepala, karena orang melupakan seberapa jarang penyakitnya sendiri.",
      "Bayes' theorem reverses the direction of the question: from “how often does this symptom appear in the sick” to “how likely is illness given the symptom”. The reversal looks trivial on paper but is almost always got wrong in the head, because people forget how rare the disease itself is.",
    ),
    keliru: bi(
      "Menukar P(E|H) dengan P(H|E) — kekeliruan paling umum di seluruh statistika terapan. Yang kedua: mengira P(E|¬H) sama dengan 1 − P(E|H). Keduanya tentang kelompok yang berbeda dan harus diketahui terpisah.",
      "Swapping P(E|H) with P(H|E) — the single most common error in all of applied statistics. Second: assuming P(E|¬H) equals 1 − P(E|H). They describe different populations and must be known separately.",
    ),
    diuji: bi(
      "Menghitung posterior dari prior dan dua likelihood. Hampir selalu disertai jebakan laju dasar: prior yang sangat kecil membuat posterior tetap kecil meski tesnya sangat akurat. Periksa jawaban Anda dengan menghitung P(E) lebih dulu — kalau posterior lebih besar daripada P(E|H), pasti ada yang salah.",
      "Computing a posterior from a prior and two likelihoods. Almost always paired with the base-rate trap: a very small prior keeps the posterior small even when the test is highly accurate. Check your answer by computing P(E) first — if the posterior exceeds P(E|H), something is wrong.",
    ),
    rumus: [
      { nama: bi("Teorema Bayes", "Bayes' theorem"), ekspresi: "P(H|E) = P(E|H) × P(H) / P(E)" },
      {
        nama: bi("Peluang bukti", "Probability of the evidence"),
        ekspresi: "P(E) = P(E|H)·P(H) + P(E|¬H)·P(¬H)",
      },
      { nama: bi("Rasio kemungkinan", "Likelihood ratio"), ekspresi: "LR = P(E|H) / P(E|¬H)" },
    ],
  },
  {
    sesi: 5,
    judul: bi(
      "Logika Fuzzy I — Himpunan dan Keanggotaan",
      "Fuzzy Logic I — Sets and Membership",
    ),
    inti: bi(
      "Zadeh mengusulkan mengganti benar-salah dengan derajat keanggotaan karena begitulah manusia menggambarkan dunia. Suhu 29 derajat tidak “panas” atau “tidak panas”; ia panas sebesar 0,4 dan hangat sebesar 0,6 sekaligus, dan justru tumpang tindih itulah yang membuat sistemnya berperilaku halus.",
      "Zadeh proposed replacing true/false with degrees of membership because that is how people actually describe the world. A temperature of 29° is neither “hot” nor “not hot”; it is hot to degree 0.4 and warm to degree 0.6 at once, and that very overlap is what makes such systems behave smoothly.",
    ),
    keliru: bi(
      "Menganggap derajat keanggotaan sebagai peluang dan mengira jumlahnya harus satu. Kekeliruan yang lebih halus: menulis himpunan di tepi semesta sebagai segitiga biasa. Himpunan tepi harus berkaki berimpit — (0, 0, 15), bukan (0, 7, 15) — kalau tidak ia bernilai nol tepat di tempat seharusnya bernilai satu.",
      "Treating membership degrees as probabilities and expecting them to sum to one. A subtler error: writing edge-of-universe sets as ordinary triangles. An edge set needs coincident feet — (0, 0, 15), not (0, 7, 15) — otherwise it evaluates to zero exactly where it should evaluate to one.",
    ),
    diuji: bi(
      "Menghitung derajat keanggotaan sebuah nilai pada himpunan segitiga atau trapesium. Perhatikan di kaki mana nilainya jatuh sebelum memilih rumusnya, dan periksa apakah kakinya berimpit.",
      "Computing a value's membership degree in a triangular or trapezoidal set. Note which leg the value falls on before choosing the formula, and check whether the feet coincide.",
    ),
    rumus: [
      { nama: bi("Segitiga", "Triangular"), ekspresi: "0 | (x−a)/(b−a) | (c−x)/(c−b) | 0" },
      {
        nama: bi("Trapesium", "Trapezoidal"),
        ekspresi: "0 | (x−a)/(b−a) | 1 | (d−x)/(d−c) | 0",
      },
    ],
  },
  {
    sesi: 6,
    judul: bi(
      "Logika Fuzzy II — Inferensi dan Penegasan",
      "Fuzzy Logic II — Inference and Defuzzification",
    ),
    inti: bi(
      "Aturan hanya menentukan kekuatan penyalaan; yang membedakan Mamdani, Sugeno, dan Tsukamoto adalah cara mengubah kekuatan itu menjadi satu angka. Karena itu aturan yang sama persis memberi tiga jawaban berbeda — dan itu bukan kesalahan melainkan konsekuensi definisi masing-masing.",
      "The rules only determine firing strength; what separates Mamdani, Sugeno, and Tsukamoto is how that strength becomes a single number. That is why identical rules give three different answers — not an error, but a consequence of each method's definition.",
    ),
    keliru: bi(
      "Mengira titik berat sama dengan rata-rata puncak aturan. Keduanya sering memberi hasil mirip pada contoh yang setangkup, dan kemiripan itu menyembunyikan perbedaannya sampai muncul soal yang tidak setangkup. Kekeliruan kedua: membiarkan ada masukan yang tidak tertutup satu aturan pun.",
      "Assuming the centroid equals the average of rule peaks. The two often agree closely on symmetric examples, and that agreement hides the difference until an asymmetric problem appears. Second: leaving inputs that no rule covers.",
    ),
    diuji: bi(
      "Menghitung kekuatan penyalaan tiap aturan, lalu menegaskannya dengan salah satu metode. Yang paling sering keluar adalah Sugeno, karena hitungannya paling pendek dan tetap menguji seluruh rantainya.",
      "Computing each rule's firing strength, then defuzzifying by one of the methods. Sugeno appears most often, because its arithmetic is shortest while still exercising the whole chain.",
    ),
    rumus: [
      {
        nama: bi("Kekuatan aturan", "Rule firing strength"),
        ekspresi: "α = min(μ₁, μ₂, …) untuk DAN, max untuk ATAU",
      },
      { nama: bi("Titik berat (Mamdani)", "Centroid (Mamdani)"), ekspresi: "z* = Σ(x·μ(x)) / Σμ(x)" },
      {
        nama: bi("Rata-rata berbobot (Sugeno)", "Weighted average (Sugeno)"),
        ekspresi: "z* = Σ(αᵢ·zᵢ) / Σαᵢ",
      },
    ],
  },
  {
    sesi: 7,
    judul: bi("Representasi Pengetahuan", "Knowledge Representation"),
    inti: bi(
      "Tabel kebenaran menjawab “apakah benar” dengan mencoba seluruh kemungkinan — jujur, tetapi barisnya berlipat dua tiap proposisi ditambahkan. Resolusi menjawab pertanyaan yang sama dengan membuktikan: menyangkal kesimpulan lalu mencari kontradiksi, tanpa perlu menyentuh sebagian besar kemungkinan.",
      "A truth table answers “is this true” by trying every possibility — honest, but the rows double with each added proposition. Resolution answers the same question by proving: negate the conclusion and look for a contradiction, without touching most of the possibilities at all.",
    ),
    keliru: bi(
      "Mengira resolusi mencari bukti langsung. Ia justru menambahkan ingkaran kesimpulan ke basis pengetahuan lalu mencari klausa kosong; kalau klausa kosong muncul, ingkarannya mustahil benar. Pada jaringan semantik, kekeliruan yang lazim adalah menuliskan ulang sifat yang sudah diwarisi dari induknya.",
      "Thinking resolution searches for direct proof. It instead adds the negated conclusion to the knowledge base and looks for the empty clause; if the empty clause appears, the negation cannot be true. In semantic networks, the usual error is restating a property already inherited from the parent.",
    ),
    diuji: bi(
      "Menyusun tabel kebenaran, menentukan tautologi atau kontradiksi, dan menelusuri satu pembuktian resolusi. Menghitung jumlah baris untuk n proposisi hampir selalu muncul sebagai soal pemanasan.",
      "Building a truth table, identifying tautologies or contradictions, and tracing one resolution proof. Counting rows for n propositions almost always appears as a warm-up question.",
    ),
    rumus: [
      {
        nama: bi("Jumlah baris tabel kebenaran", "Truth-table row count"),
        ekspresi: "2ⁿ untuk n proposisi",
      },
    ],
  },
  {
    sesi: 8,
    judul: bi("Teknik Pencarian dan Heuristik", "Search Techniques and Heuristics"),
    inti: bi(
      "Yang membedakan algoritma pencarian bukan apakah mereka menemukan jalan, melainkan berapa banyak simpul yang harus diperiksa untuk itu. Heuristik yang baik memangkas pemeriksaan tanpa mengorbankan jaminan — dan syaratnya satu: ia tidak boleh menaksir lebih besar daripada biaya sebenarnya.",
      "What separates search algorithms is not whether they find a path but how many nodes they must examine to do so. A good heuristic prunes that examination without giving up the guarantee — and its one requirement is that it never overestimates the true cost.",
    ),
    keliru: bi(
      "Mengira heuristik yang lebih besar lebih baik karena membuat pencarian lebih cepat. Ia memang lebih cepat, tetapi berhenti menjamin jalur terpendek. Kekeliruan kedua: mengira DFS menemukan jalur terpendek karena ia sampai lebih dulu pada contoh tertentu.",
      "Assuming a larger heuristic is better because it makes search faster. It is indeed faster, but it stops guaranteeing the shortest path. Second: assuming DFS finds the shortest path because it arrived first on one particular example.",
    ),
    diuji: bi(
      "Menelusuri BFS, DFS, atau A* langkah demi langkah pada graf kecil, dan menjelaskan syarat admissible. Jarak Manhattan sebagai heuristik peta berpetak hampir selalu muncul.",
      "Tracing BFS, DFS, or A* step by step on a small graph, and explaining the admissibility condition. Manhattan distance as a grid-map heuristic almost always appears.",
    ),
    rumus: [
      { nama: bi("Fungsi evaluasi A*", "A* evaluation function"), ekspresi: "f(n) = g(n) + h(n)" },
      { nama: bi("Jarak Manhattan", "Manhattan distance"), ekspresi: "d = |x₁−x₂| + |y₁−y₂|" },
    ],
  },
  {
    sesi: 9,
    judul: bi("Jaringan Syaraf Tiruan", "Artificial Neural Networks"),
    inti: bi(
      "Perceptron satu lapis hanya bisa menarik satu garis lurus, dan temuan Minsky–Papert bahwa XOR tidak terpisahkan secara linear menghentikan penelitian bidang ini hampir dua dekade. Perambatan balik memecahkannya dengan menambah lapisan tersembunyi, sehingga batas keputusannya boleh melengkung.",
      "A single-layer perceptron can only draw one straight line, and Minsky and Papert's finding that XOR is not linearly separable halted research in the field for nearly two decades. Backpropagation resolved it by adding a hidden layer, letting the decision boundary curve.",
    ),
    keliru: bi(
      "Menyetel laju belajar sebesar-besarnya agar pelatihannya cepat. Langkah yang terlalu besar melewati titik terendah lalu memantul ke sisi seberang; cirinya khas — kurva galatnya berayun dan tidak pernah mengecil, berbeda dari laju terlalu kecil yang menurun tetapi lambat.",
      "Setting the learning rate as high as possible to train faster. Too large a step overshoots the minimum and bounces to the far side; the signature is distinctive — the error curve oscillates and never shrinks, unlike too small a rate, which descends but slowly.",
    ),
    diuji: bi(
      "Menghitung keluaran satu neuron dari bobot dan masukannya, menerapkan fungsi aktivasi, dan menjelaskan kenapa XOR memerlukan lapisan tersembunyi.",
      "Computing one neuron's output from its weights and inputs, applying an activation function, and explaining why XOR requires a hidden layer.",
    ),
    rumus: [
      { nama: bi("Keluaran neuron", "Neuron output"), ekspresi: "y = f(Σ wᵢxᵢ + b)" },
      { nama: bi("Sigmoid", "Sigmoid"), ekspresi: "σ(x) = 1 / (1 + e⁻ˣ)" },
      { nama: bi("Pembaruan bobot", "Weight update"), ekspresi: "wᵢ ← wᵢ + η · δ · xᵢ" },
    ],
  },
  {
    sesi: 10,
    judul: bi("Pemrosesan Bahasa Alami", "Natural Language Processing"),
    inti: bi(
      "Pencari kata dasar Bahasa Indonesia tidak bisa meminjam algoritma Bahasa Inggris, karena sebagian awalan kita meluluhkan huruf pertama kata dasarnya: “menyapu” berasal dari “sapu”, bukan “nyapu”. Aturan pengupasan saja tidak cukup — ia harus disertai pemeriksaan kamus.",
      "An Indonesian stemmer cannot borrow an English algorithm, because some Indonesian prefixes dissolve the root's first letter: “menyapu” comes from “sapu”, not “nyapu”. Stripping rules alone are not enough — they must be paired with a dictionary check.",
    ),
    keliru: bi(
      "Mengira pengupasan imbuhan bisa dijalankan sampai habis. Tanpa pemeriksaan kamus, “beruang” akan dikupas menjadi “uang” — kata yang sah tetapi maknanya sama sekali lain, dan tidak ada aturan pengupasan yang bisa mencegahnya. Pada TF-IDF, kekeliruan lazimnya mengira kata yang sering muncul di semua dokumen berbobot tinggi.",
      "Assuming affix stripping can simply run to exhaustion. Without a dictionary check, “beruang” (bear) strips to “uang” (money) — a valid word with an entirely different meaning, and no stripping rule can prevent it. In TF-IDF, the usual error is assuming a word frequent across all documents carries high weight.",
    ),
    diuji: bi(
      "Menentukan kata dasar sebuah kata berimbuhan, menghitung TF-IDF satu kata, dan menjelaskan kenapa kata yang muncul di mana-mana justru tidak informatif.",
      "Finding the root of an affixed word, computing TF-IDF for one term, and explaining why a word appearing everywhere carries no information.",
    ),
    rumus: [{ nama: bi("TF-IDF", "TF-IDF"), ekspresi: "tf-idf = tf × log(N / df)" }],
  },
  {
    sesi: 11,
    judul: bi("Sistem Pakar", "Expert Systems"),
    inti: bi(
      "Sistem pakar memisahkan pengetahuan dari mesin inferensinya, sehingga pakar bisa mengubah aturan tanpa menyentuh kode. Runut maju bertanya “apa yang bisa disimpulkan”; runut mundur bertanya “benarkah dugaan ini, dan gejala mana yang masih perlu saya tanyakan”. Keduanya memakai basis aturan yang sama.",
      "An expert system separates knowledge from its inference engine, so a domain expert can change rules without touching code. Forward chaining asks “what can be concluded”; backward chaining asks “is this hypothesis true, and which symptom must I still ask about”. Both use the same rule base.",
    ),
    keliru: bi(
      "Menganggap fasilitas penjelasan sebagai pelengkap. Sistem pakar yang tidak bisa menjawab “kenapa” hanyalah tebakan bercangkang komputer. Cacat yang paling sulit ditemukan: fakta yang dipakai sebagai premis tetapi tidak bisa disimpulkan maupun ditanyakan — ia diam-diam dianggap tidak berlaku, tanpa satu pun pesan galat.",
      "Treating the explanation facility as optional. An expert system that cannot answer “why” is guesswork in a computer's shell. The hardest defect to find: a fact used as a premise that can neither be concluded nor asked about — it is silently treated as false, with no error message at all.",
    ),
    diuji: bi(
      "Menelusuri runut maju pada basis aturan kecil sampai keadaan tetap, dan menyebutkan komponen sistem pakar. Sering digabung dengan certainty factor sesi 3.",
      "Tracing forward chaining on a small rule base to a fixed point, and naming the components of an expert system. Often combined with certainty factors from session 3.",
    ),
    rumus: [],
  },
  {
    sesi: 12,
    judul: bi("Sains Data dan Big Data", "Data Science and Big Data"),
    inti: bi(
      "Tiga V — Volume, Velocity, Variety — bukan sekadar sifat data melainkan tiga alasan berbeda kenapa perkakas lama berhenti bekerja. Volume memaksa penyimpanan tersebar, Velocity memaksa pemrosesan aliran, dan Variety memaksa skema yang tidak ditetapkan di muka.",
      "The three Vs — Volume, Velocity, Variety — are not merely properties of data but three distinct reasons why older tooling stops working. Volume forces distributed storage, Velocity forces stream processing, and Variety forces schemas that are not fixed in advance.",
    ),
    keliru: bi(
      "Mengira big data hanya soal ukuran. Data seratus gigabita yang datang sekali setahun jauh lebih mudah ditangani daripada satu gigabita per detik, dan keduanya membutuhkan perkakas yang sama sekali berbeda.",
      "Thinking big data is only about size. A hundred gigabytes arriving once a year is far easier to handle than one gigabyte per second, and the two demand entirely different tooling.",
    ),
    diuji: bi(
      "Menyebutkan dan menjelaskan tiga V, dan membedakan tahapan dalam alur kerja sains data. Hampir seluruhnya pilihan ganda.",
      "Naming and explaining the three Vs, and distinguishing the stages of a data-science workflow. Almost entirely multiple choice.",
    ),
    rumus: [],
  },
  {
    sesi: 13,
    judul: bi("Pembelajaran Mesin", "Machine Learning"),
    inti: bi(
      "Entropi mengukur ketidakpastian dalam satuan bit: nol berarti seluruh data satu kelas, satu bit berarti dua kelas berimbang sempurna. ID3 memilih atribut yang paling banyak menurunkannya. Yang layak diperhatikan bukan atribut mana yang menang, melainkan jaraknya ke urutan kedua — kalau nyaris sama, pohonnya rapuh.",
      "Entropy measures uncertainty in bits: zero means every record is one class, one bit means two perfectly balanced classes. ID3 picks the attribute that reduces it most. What deserves attention is not which attribute wins but its margin over second place — if they are nearly equal, the tree is fragile.",
    ),
    keliru: bi(
      "Memakai rata-rata biasa alih-alih rata-rata berbobot saat menghitung entropi sesudah pemecahan; cabang berisi satu data akan dihitung sama pentingnya dengan cabang berisi sepuluh. Kekeliruan kedua: lupa tanda negatif di depan rumus entropi, sehingga hasilnya keluar negatif.",
      "Using a plain average instead of a weighted one when computing post-split entropy; a branch holding one record then counts as heavily as one holding ten. Second: forgetting the minus sign in front of the entropy formula, so the result comes out negative.",
    ),
    diuji: bi(
      "Menghitung entropi sebuah sebaran, menghitung perolehan informasi satu atribut, dan menentukan atribut pemecah pertama. Ditambah kNN dan k-means yang biasanya berupa perhitungan jarak.",
      "Computing the entropy of a distribution, the information gain of one attribute, and identifying the first splitting attribute. Plus kNN and k-means, usually as distance calculations.",
    ),
    rumus: [
      { nama: bi("Entropi", "Entropy"), ekspresi: "H(S) = −Σ pᵢ · log₂(pᵢ)" },
      {
        nama: bi("Perolehan informasi", "Information gain"),
        ekspresi: "IG(S,A) = H(S) − Σ (|Sᵥ|/|S|)·H(Sᵥ)",
      },
      { nama: bi("Gini", "Gini"), ekspresi: "Gini(S) = 1 − Σ pᵢ²" },
      { nama: bi("Jarak Euclidean", "Euclidean distance"), ekspresi: "d = √(Σ (aᵢ − bᵢ)²)" },
    ],
  },
  {
    sesi: 14,
    judul: bi("Robotika", "Robotics"),
    inti: bi(
      "Kendali PID menggabungkan tiga cara memandang galat: yang sekarang, yang menumpuk, dan yang sedang berubah. Yang membuat sistem stabil bukan penguatan yang besar melainkan yang seimbang di antara ketiganya — menaikkan salah satunya sendirian hampir selalu membuatnya berayun.",
      "PID control combines three ways of looking at error: the present one, the accumulated one, and the changing one. What makes a system stable is not large gain but balance among the three — raising any one alone almost always makes it oscillate.",
    ),
    keliru: bi(
      "Mengira bagian proporsional saja cukup. Ia selalu menyisakan galat tunak, karena saat galatnya kecil koreksinya ikut kecil dan tidak pernah menutup sisanya; itulah tugas bagian integral. Pada kinematika, kekeliruan lazimnya mengira kinematika balik selalu punya satu jawaban.",
      "Assuming the proportional term alone suffices. It always leaves steady-state error, because as the error shrinks so does the correction, never closing the remainder; that is the integral term's job. In kinematics, the usual error is assuming inverse kinematics always has exactly one solution.",
    ),
    diuji: bi(
      "Menyebutkan peran tiap bagian PID, dan membedakan kinematika maju dari balik. Kadang disertai perhitungan posisi ujung lengan dari sudut sendinya.",
      "Naming the role of each PID term, and distinguishing forward from inverse kinematics. Sometimes with a calculation of end-effector position from joint angles.",
    ),
    rumus: [
      { nama: bi("Kendali PID", "PID control"), ekspresi: "u(t) = Kp·e + Ki·∫e dt + Kd·de/dt" },
      {
        nama: bi("Kinematika maju dua sendi", "Two-joint forward kinematics"),
        ekspresi: "x = L₁cos θ₁ + L₂cos(θ₁+θ₂)",
      },
    ],
  },
];
