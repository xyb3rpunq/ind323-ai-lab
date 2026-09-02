/// Mesin bank soal dan sesi ujian bertimer.
///
/// # Kenapa kunci jawabannya dihitung, bukan diketik
///
/// Soal berhitung di bank ini tidak menyimpan jawabannya sebagai teks. Ia
/// menyimpan **cara menghitungnya**, lalu jawabannya dihasilkan modul `Inti`
/// yang sama yang diadu terhadap vektor uji lintas bahasa.
///
/// Alasannya: kunci jawaban yang diketik tangan pasti menyimpang dari
/// algoritmanya cepat atau lambat, dan menyimpangnya tidak akan pernah
/// terlihat — soalnya tetap terbaca masuk akal, dan mahasiswa yang menjawab
/// benar justru dinyatakan salah. Kunci yang dihitung tidak bisa menyimpang:
/// kalau ia salah, seluruh uji konformansi ikut gagal.
///
/// # Kenapa pengacakannya deterministik
///
/// Sesi latihan yang bisa diulang jauh lebih berguna daripada yang berubah
/// tiap kali dibuka. Mahasiswa perlu bisa mengulang soal yang sama setelah
/// mempelajari kesalahannya, dan dosen perlu bisa merujuk "sesi benih 42"
/// tanpa ambiguitas.
///
/// .Deckyx

// ---------------------------------------------------------------------------
// Model soal
// ---------------------------------------------------------------------------

/// Sepasang teks untuk kedua bahasa yang didukung situs ini.
///
/// # Kenapa pasangan, bukan kamus berkunci
///
/// Karena kedua bahasa ditulis di baris yang sama, sehingga tidak mungkin
/// menyunting salah satunya tanpa melihat yang lain. Kamus berkunci selalu
/// berakhir sama: yang satu diperbaiki, yang lain tertinggal — dan yang
/// tertinggal hampir selalu bahasa yang tidak dipakai penulisnya sehari-hari,
/// sehingga penulisnya sendiri tidak akan pernah melihatnya.
///
/// Di sini bentuk pasangan juga membuat terjemahan yang hilang menjadi
/// **galat kompilasi**, bukan soal yang tampil kosong di tengah ujian.
public struct Dwibahasa: Equatable, Sendable {
    public let id: String
    public let en: String

    public init(_ id: String, _ en: String) {
        self.id = id
        self.en = en
    }
}

/// Menyusun sepasang teks. Ditulis pendek karena dipakai ratusan kali.
public func bi(_ id: String, _ en: String) -> Dwibahasa {
    Dwibahasa(id, en)
}

/// Cara sebuah soal dinilai.
public enum BentukSoal: Equatable, Sendable {
    /// Pilihan ganda; jawabannya indeks pilihan yang benar.
    ///
    /// Indeksnya tetap, bukan teksnya. Menerjemahkan pilihan tidak bisa
    /// menggeser kunci jawabannya, karena kuncinya sama sekali tidak menunjuk
    /// ke teks mana pun.
    case pilihan(pilihan: [Dwibahasa], benar: Int)
    /// Jawaban berupa angka; dinilai dengan toleransi.
    case angka(jawaban: Double, toleransi: Double, satuan: Dwibahasa)
    /// Benar atau salah.
    case benarSalah(benar: Bool)
}

/// Satu soal di bank.
public struct Soal: Equatable, Sendable {
    public let kode: String
    public let sesi: Int
    /// Kunci pengelompokan, **bukan** teks yang ditampilkan.
    ///
    /// Sengaja tetap satu untai. Ia dipakai mengelompokkan ketepatan per topik,
    /// dan kunci yang ikut berganti bahasa akan menghasilkan pengelompokan yang
    /// berbeda di tiap bahasa — dua ringkasan yang tidak bisa dibandingkan.
    /// Nama yang dibaca manusia disusun sisi antarmuka dari kunci ini.
    public let topik: String
    public let pertanyaan: Dwibahasa
    public let bentuk: BentukSoal
    /// Penjelasan yang muncul setelah dijawab. Selalu ada — soal tanpa
    /// penjelasan hanya menguji, tidak mengajari.
    public let pembahasan: Dwibahasa
    /// Tingkat kesulitan 1 sampai 3, dipakai menyusun sesi yang berimbang.
    public let tingkat: Int

    public init(
        kode: String,
        sesi: Int,
        topik: String,
        pertanyaan: Dwibahasa,
        bentuk: BentukSoal,
        pembahasan: Dwibahasa,
        tingkat: Int = 2
    ) {
        self.kode = kode
        self.sesi = sesi
        self.topik = topik
        self.pertanyaan = pertanyaan
        self.bentuk = bentuk
        self.pembahasan = pembahasan
        self.tingkat = tingkat
    }
}

/// Jawaban yang diberikan peserta.
public enum Jawaban: Equatable, Sendable {
    case pilihan(Int)
    case angka(Double)
    case benarSalah(Bool)
    /// Dilewati atau waktunya habis sebelum dijawab.
    case kosong
}

/// Hasil penilaian satu soal.
public struct Penilaian: Equatable, Sendable {
    public let kode: String
    public let benar: Bool
    /// Selisih terhadap jawaban seharusnya, untuk soal berangka.
    public let selisih: Double?
    public let pembahasan: String
}

// ---------------------------------------------------------------------------
// Penilaian
// ---------------------------------------------------------------------------

public enum Penilai {
    /// Menilai satu jawaban terhadap soalnya.
    ///
    /// Soal berangka dinilai dengan toleransi mutlak, bukan dengan
    /// perbandingan persis. Menuntut kesamaan persis pada jawaban yang
    /// dihitung tangan berarti menghukum pembulatan yang wajar — dan
    /// mahasiswa yang menulis 0,79 untuk jawaban 0,79000000000000004 tidak
    /// sedang keliru.
    public static func nilai(_ soal: Soal, _ jawaban: Jawaban) -> Penilaian {
        switch (soal.bentuk, jawaban) {
        case let (.pilihan(_, benar), .pilihan(dipilih)):
            return Penilaian(kode: soal.kode, benar: dipilih == benar, selisih: nil, pembahasan: soal.pembahasan)

        case let (.angka(seharusnya, toleransi, _), .angka(diberi)):
            guard diberi.isFinite else {
                return Penilaian(kode: soal.kode, benar: false, selisih: nil, pembahasan: soal.pembahasan)
            }
            let selisih = abs(diberi - seharusnya)
            return Penilaian(kode: soal.kode, benar: selisih <= toleransi, selisih: selisih, pembahasan: soal.pembahasan)

        case let (.benarSalah(seharusnya), .benarSalah(diberi)):
            return Penilaian(kode: soal.kode, benar: diberi == seharusnya, selisih: nil, pembahasan: soal.pembahasan)

        default:
            // Jawaban kosong, atau bentuk jawaban yang tidak cocok dengan
            // bentuk soalnya. Keduanya dinilai salah, tidak dilewati: soal
            // yang tidak dijawab tetap soal yang tidak dikuasai.
            return Penilaian(kode: soal.kode, benar: false, selisih: nil, pembahasan: soal.pembahasan)
        }
    }
}

// ---------------------------------------------------------------------------
// Penyusun sesi
// ---------------------------------------------------------------------------

/// Sesi ujian yang sudah disusun.
public struct Sesi: Equatable, Sendable {
    public let benih: UInt64
    public let soal: [Soal]
    /// Batas waktu seluruh sesi, dalam detik.
    public let batasDetik: Int
}

public enum PenyusunSesi {
    /// Waktu yang diberikan per soal, dalam detik.
    public static let detikPerSoal = 90

    /// Menyusun sesi dari bank soal.
    ///
    /// Bila `sesiTerpilih` diisi, hanya soal dari sesi kuliah itu yang dipakai.
    /// Urutannya diacak memakai benih yang diberikan, sehingga sesi dengan
    /// benih sama selalu berisi soal yang sama dalam urutan yang sama.
    ///
    /// Pilihan pada soal pilihan ganda ikut diacak, dan indeks jawaban
    /// benarnya diperbarui mengikutinya. Tanpa itu, jawaban benar akan selalu
    /// berada di posisi yang sama dan mahasiswa akan menghafal posisinya
    /// alih-alih materinya.
    public static func susun(
        bank: [Soal],
        banyak: Int,
        benih: UInt64,
        sesiTerpilih: Int? = nil
    ) -> Sesi {
        var tersedia = bank
        if let s = sesiTerpilih {
            tersedia = tersedia.filter { $0.sesi == s }
        }
        // Diurutkan lebih dulu menurut kode. Urutan bank di berkas sumber bisa
        // berubah kapan saja, dan tanpa pengurutan ini benih yang sama akan
        // menghasilkan sesi yang berbeda setelah seseorang menyisipkan satu soal.
        tersedia.sort { $0.kode < $1.kode }

        var acak = SplitMix64(benih: benih)
        acak.acak(&tersedia)

        let dipakai = Array(tersedia.prefix(max(0, banyak))).map { acakPilihan($0, &acak) }
        return Sesi(benih: benih, soal: dipakai, batasDetik: dipakai.count * detikPerSoal)
    }

    /// Mengacak urutan pilihan sebuah soal, sekaligus memindahkan kunci benarnya.
    static func acakPilihan(_ soal: Soal, _ acak: inout SplitMix64) -> Soal {
        guard case let .pilihan(pilihan, benar) = soal.bentuk, pilihan.count > 1 else {
            return soal
        }
        var indeks = Array(0..<pilihan.count)
        acak.acak(&indeks)
        let baru = indeks.map { pilihan[$0] }
        guard let benarBaru = indeks.firstIndex(of: benar) else { return soal }
        return Soal(
            kode: soal.kode,
            sesi: soal.sesi,
            topik: soal.topik,
            pertanyaan: soal.pertanyaan,
            bentuk: .pilihan(pilihan: baru, benar: benarBaru),
            pembahasan: soal.pembahasan,
            tingkat: soal.tingkat
        )
    }
}

// ---------------------------------------------------------------------------
// Ringkasan hasil
// ---------------------------------------------------------------------------

/// Ringkasan sebuah sesi yang sudah selesai dikerjakan.
public struct Ringkasan: Equatable, Sendable {
    public let benar: Int
    public let total: Int
    /// Nilai 0 sampai 100.
    public let nilai: Double
    /// Ketepatan per topik, untuk menunjukkan bagian mana yang perlu diulang.
    public let perTopik: [(topik: String, benar: Int, total: Int)]

    public static func == (a: Ringkasan, b: Ringkasan) -> Bool {
        a.benar == b.benar && a.total == b.total && a.nilai == b.nilai
            && a.perTopik.count == b.perTopik.count
            && zip(a.perTopik, b.perTopik).allSatisfy { $0 == $1 }
    }
}

public enum Perangkum {
    /// Merangkum hasil sebuah sesi.
    ///
    /// Rincian per topik diurutkan menurut ketepatan **menaik**, sehingga topik
    /// terlemah muncul lebih dulu. Mengurutkannya menurut nama akan membuat
    /// bagian yang paling perlu diulang tenggelam di tengah daftar.
    public static func rangkum(soal: [Soal], penilaian: [Penilaian]) -> Ringkasan {
        let benar = penilaian.filter(\.benar).count
        let total = penilaian.count
        let nilai = total == 0 ? 0.0 : Double(benar) / Double(total) * 100.0

        var peta: [String: (benar: Int, total: Int)] = [:]
        let indeksSoal = Dictionary(uniqueKeysWithValues: soal.map { ($0.kode, $0) })
        for p in penilaian {
            guard let s = indeksSoal[p.kode] else { continue }
            var catatan = peta[s.topik] ?? (0, 0)
            catatan.total += 1
            if p.benar { catatan.benar += 1 }
            peta[s.topik] = catatan
        }

        let perTopik = peta.keys.sorted { kiri, kanan in
            let a = peta[kiri]!
            let b = peta[kanan]!
            let ta = Double(a.benar) / Double(a.total)
            let tb = Double(b.benar) / Double(b.total)
            // Seri dipecah menurut nama supaya laporannya sama tiap kali
            // dihasilkan, bukan bergantung urutan kamus.
            return ta == tb ? kiri < kanan : ta < tb
        }.map { (topik: $0, benar: peta[$0]!.benar, total: peta[$0]!.total) }

        return Ringkasan(benar: benar, total: total, nilai: nilai, perTopik: perTopik)
    }
}

// ---------------------------------------------------------------------------
// Penjadwal ulangan
// ---------------------------------------------------------------------------

/// Keadaan hafalan sebuah soal, mengikuti algoritma SM-2.
public struct Hafalan: Equatable, Sendable {
    public var kode: String
    /// Berapa kali berturut-turut dijawab benar.
    public var ulangan: Int
    /// Jarak hari sampai ulangan berikutnya.
    public var jarakHari: Int
    /// Faktor kemudahan; makin kecil makin sering diulang.
    public var kemudahan: Double

    public init(kode: String, ulangan: Int = 0, jarakHari: Int = 0, kemudahan: Double = 2.5) {
        self.kode = kode
        self.ulangan = ulangan
        self.jarakHari = jarakHari
        self.kemudahan = kemudahan
    }
}

public enum Penjadwal {
    /// Batas bawah faktor kemudahan.
    ///
    /// SM-2 asli memakai 1,3. Tanpa batas bawah, soal yang berkali-kali salah
    /// akan mendapat faktor mendekati nol dan muncul terus-menerus sampai
    /// menutupi seluruh sesi — menghukum mahasiswa karena satu topik yang
    /// belum dikuasai, bukan membantunya.
    public static let kemudahanMinimum = 1.3

    /// Memperbarui jadwal setelah sebuah soal dijawab.
    ///
    /// `mutu` bernilai 0 sampai 5 seperti SM-2 asli: 0 sampai 2 berarti salah,
    /// 3 ke atas berarti benar dengan tingkat kelancaran yang berbeda.
    public static func perbarui(_ h: Hafalan, mutu: Int) -> Hafalan {
        let q = min(max(mutu, 0), 5)
        var baru = h

        if q < 3 {
            // Salah mengembalikan hitungannya ke nol, tetapi tidak menghapus
            // faktor kemudahannya. Yang perlu diulang adalah soalnya, bukan
            // seluruh riwayat belajarnya.
            baru.ulangan = 0
            baru.jarakHari = 1
        } else {
            baru.ulangan = h.ulangan + 1
            switch baru.ulangan {
            case 1: baru.jarakHari = 1
            case 2: baru.jarakHari = 6
            default: baru.jarakHari = Int((Double(h.jarakHari) * h.kemudahan).rounded())
            }
        }

        let d = Double(q)
        baru.kemudahan = max(
            kemudahanMinimum,
            h.kemudahan + (0.1 - (5.0 - d) * (0.08 + (5.0 - d) * 0.02))
        )
        return baru
    }

    /// Mengubah hasil penilaian menjadi nilai mutu SM-2.
    ///
    /// Jawaban benar yang cepat dinilai lebih tinggi daripada yang lambat,
    /// karena kelancaran adalah bagian dari penguasaan — jawaban benar setelah
    /// menimbang satu menit menandakan materinya belum benar-benar melekat.
    public static func mutu(benar: Bool, detik: Int, batasDetik: Int) -> Int {
        guard benar else { return detik >= batasDetik ? 0 : 2 }
        let bagian = batasDetik > 0 ? Double(detik) / Double(batasDetik) : 1.0
        if bagian <= 0.34 { return 5 }
        if bagian <= 0.67 { return 4 }
        return 3
    }
}
