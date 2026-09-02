/// Pertukaran bilangan pecahan secara bit-eksak.
///
/// # Kenapa berkas ini ada
///
/// Algoritma di paket ini sudah pernah ditulis empat kali di proyek lain —
/// Rust, Go, PL/SQL, dan Lua — dan keempatnya diadu memakai berkas vektor yang
/// sama. Implementasi Swift ini menjadi yang kelima, dan perbandingan itu hanya
/// bermakna kalau angkanya berpindah tanpa berubah sedikit pun.
///
/// Desimal tidak memenuhi syarat itu. Pengukuran pada proyek pendahulunya
/// menemukan sebuah pengurai desimal yang salah membulat sebesar 1 ULP pada
/// 27.548 dari 200.000 nilai uji. Menulis `0.42000000000000004` lalu
/// membacanya kembali bisa menghasilkan `0.42` — angka yang berbeda.
///
/// Karena itu seluruh pertukarannya memakai pola bit 64-bit dalam heksadesimal.
///
/// .Deckyx

/// Seberapa jauh sebuah perhitungan bisa dituntut sama antarbahasa.
///
/// Menyamakan hasil lintas bahasa hanya masuk akal bila targetnya ditetapkan
/// lebih dulu. Tidak semua perhitungan bisa dituntut sama persis, dan menuntut
/// yang mustahil hanya menghasilkan uji yang gagal berselang-seling tanpa ada
/// yang benar-benar salah.
public enum Keterbandingan: Equatable, Sendable {
    /// Hasilnya wajib identik bit demi bit.
    ///
    /// Hanya berlaku untuk perhitungan yang seluruhnya memakai penjumlahan,
    /// pengurangan, perkalian, pembagian, akar kuadrat, dan perbandingan.
    /// IEEE-754 mewajibkan keenamnya dibulatkan dengan benar.
    case bitEksak

    /// Hasilnya boleh berbeda beberapa ULP.
    ///
    /// Berlaku untuk perhitungan yang menyentuh fungsi transendental — `exp`,
    /// `log`, `pow`. IEEE-754 **tidak** mewajibkan fungsi-fungsi ini
    /// dibulatkan dengan benar, jadi pustaka matematika yang berbeda boleh
    /// menghasilkan nilai yang berbeda untuk masukan yang sama.
    case hampirSama(maksUlp: UInt64)

    /// Hasilnya adalah selisih dua besaran yang hampir sama besar.
    ///
    /// Toleransinya diukur pada skala kedua besaran itu, bukan pada hasilnya.
    /// Perolehan informasi adalah contohnya: galat dua ULP pada entropi sebesar
    /// 0,94 bernilai mutlak sekitar 2,2e-16, dan pada hasil sebesar 0,029 nilai
    /// itu sama dengan 64 ULP.
    case selisihMeniadakan(maksUlp: UInt64)

    /// Hanya sifatnya yang bisa dituntut, bukan angkanya.
    case sifatSaja

    /// Menguraikan penanda dari kepala berkas vektor.
    public init?(penanda: String) {
        let t = pangkas(penanda)
        switch t {
        case "BitExact":
            self = .bitEksak
        case "PropertyOnly":
            self = .sifatSaja
        default:
            if let n = Keterbandingan.angkaDalamKurung(t, awalan: "NearlyEqual") {
                self = .hampirSama(maksUlp: n)
            } else if let n = Keterbandingan.angkaDalamKurung(t, awalan: "CancellingDifference") {
                self = .selisihMeniadakan(maksUlp: n)
            } else {
                return nil
            }
        }
    }

    private static func angkaDalamKurung(_ teks: String, awalan: String) -> UInt64? {
        guard teks.hasPrefix(awalan + "("), teks.hasSuffix(")") else { return nil }
        let mulai = teks.index(teks.startIndex, offsetBy: awalan.count + 1)
        let akhir = teks.index(before: teks.endIndex)
        return UInt64(teks[mulai..<akhir])
    }

    /// Nama penandanya, sama persis dengan yang tertulis di berkas vektor.
    public var nama: String {
        switch self {
        case .bitEksak: return "BitExact"
        case .hampirSama(let n): return "NearlyEqual(\(n))"
        case .selisihMeniadakan(let n): return "CancellingDifference(\(n))"
        case .sifatSaja: return "PropertyOnly"
        }
    }

    /// Apakah tingkat ini menuntut skala disertakan.
    public var butuhSkala: Bool {
        if case .selisihMeniadakan = self { return true }
        return false
    }

    /// Apakah dua nilai memenuhi tingkat keterbandingan ini.
    ///
    /// Pada tingkat bit-eksak yang dituntut adalah kesamaan **pola bit**, bukan
    /// jarak ULP nol. Keduanya terlihat sama tetapi tidak sama: IEEE-754
    /// menyatakan `0.0 == -0.0` bernilai benar sehingga jaraknya nol, padahal
    /// pola bitnya berbeda dan menyebar berbeda pula — `1/0` menghasilkan tak
    /// hingga positif sedangkan `1/(-0)` menghasilkan tak hingga negatif.
    public func terpenuhi(_ a: Double, _ b: Double, skala: Double? = nil) -> Bool {
        if case .sifatSaja = self { return true }
        if Fx.samaBit(a, b) { return true }

        switch self {
        case .bitEksak:
            return false

        case .hampirSama(let maks):
            guard let d = Fx.jarakUlp(a, b) else { return false }
            return d <= maks

        case .selisihMeniadakan(let maks):
            // Tingkat berskala menuntut skala. Tanpa skala yang dikembalikan
            // adalah pemeriksaan paling ketat, bukan paling longgar: pemanggil
            // yang lupa memberinya akan melihat kegagalan, bukan kelolosan palsu.
            guard let s = skala, s.isFinite, a.isFinite, b.isFinite else { return false }
            return abs(a - b) <= Double(maks) * Fx.langkahUlp(s)

        case .sifatSaja:
            return true
        }
    }
}

/// Membuang spasi di kedua ujung teks.
///
/// Ditulis sendiri alih-alih memakai `trimmingCharacters` dari Foundation.
/// Di bawah WASI, menarik Foundation hanya untuk memangkas spasi membesarkan
/// biner WebAssembly-nya berkali lipat tanpa menambah kemampuan apa pun.
@inlinable
public func pangkas(_ teks: String) -> String {
    // 32 spasi, 9 tab, 13 gerak balik, 10 baris baru.
    func spasi(_ c: Character) -> Bool {
        guard let v = c.asciiValue else { return false }
        return v == 32 || v == 9 || v == 13 || v == 10
    }
    var mulai = teks.startIndex
    var akhir = teks.endIndex
    while mulai < akhir, spasi(teks[mulai]) {
        mulai = teks.index(after: mulai)
    }
    while akhir > mulai, spasi(teks[teks.index(before: akhir)]) {
        akhir = teks.index(before: akhir)
    }
    return String(teks[mulai..<akhir])
}

/// Pertukaran pecahan bit-eksak dan pengukuran jaraknya.
public enum Fx {
    /// Panjang representasi heksadesimal sebuah pecahan: 16 digit.
    public static let panjangHex = 16

    /// Toleransi bawaan untuk perhitungan yang menyentuh fungsi transendental.
    public static let ulpTransendental: UInt64 = 4

    /// Mengubah pecahan menjadi 16 digit heksadesimal huruf kecil.
    public static func keHex(_ v: Double) -> String {
        // `bitPattern` mengembalikan pola bit apa adanya, termasuk tanda nol
        // negatif. Jangan menggantinya dengan konversi lewat teks desimal:
        // di sanalah tanda nol dan bit terakhir paling sering hilang.
        let bits = v.bitPattern
        var hex = String(bits, radix: 16)
        while hex.count < panjangHex {
            hex = "0" + hex
        }
        return hex
    }

    /// Kesalahan saat membaca pola bit dari teks.
    public enum GalatHex: Error, Equatable {
        case panjangSalah(Int)
        case bukanHeksadesimal(String)
    }

    /// Membaca pecahan dari 16 digit heksadesimal.
    ///
    /// Menolak panjang yang salah alih-alih diam-diam menghasilkan angka lain:
    /// teks 14 digit adalah pola bit yang sah, hanya bukan yang dimaksud.
    public static func dariHex(_ teks: String) throws -> Double {
        let t = pangkas(teks)
        guard t.count == panjangHex else { throw GalatHex.panjangSalah(t.count) }
        guard let bits = UInt64(t, radix: 16) else { throw GalatHex.bukanHeksadesimal(t) }
        return Double(bitPattern: bits)
    }

    /// Apakah dua nilai sama persis pada tingkat bit, dengan NaN dianggap sama.
    ///
    /// Perbandingan `==` biasa menyatakan NaN tidak sama dengan dirinya
    /// sendiri, padahal untuk mengadu dua implementasi kita justru ingin
    /// "sama-sama menghasilkan NaN" dinilai lolos.
    public static func samaBit(_ a: Double, _ b: Double) -> Bool {
        if a.isNaN && b.isNaN { return true }
        return a.bitPattern == b.bitPattern
    }

    /// Kunci terurut monoton dari pola bit.
    ///
    /// Pola bit dibaca sebagai bilangan bertanda, lalu yang negatif dicerminkan
    /// sehingga urutan bilangan bulatnya sepadan dengan urutan pecahannya.
    private static func kunciUrut(_ v: Double) -> Int64 {
        let bits = Int64(bitPattern: v.bitPattern)
        return bits < 0 ? Int64.min &- bits : bits
    }

    /// Jarak dua pecahan dalam satuan ULP, atau `nil` bila tidak terdefinisi.
    public static func jarakUlp(_ a: Double, _ b: Double) -> UInt64? {
        if a.isNaN || b.isNaN { return nil }
        if a == b { return 0 }
        if a.isInfinite || b.isInfinite { return nil }
        let ka = kunciUrut(a)
        let kb = kunciUrut(b)
        // Selisihnya bisa melewati batas bilangan bulat bertanda, jadi
        // dihitung sebagai selisih mutlak tak bertanda.
        return ka > kb ? UInt64(bitPattern: ka &- kb) : UInt64(bitPattern: kb &- ka)
    }

    /// Jarak antara `x` dan pecahan berikutnya yang lebih besar nilai mutlaknya.
    ///
    /// Dipakai untuk menyatakan toleransi pada skala tempat aritmetikanya
    /// terjadi, bukan pada hasil akhirnya. Satu ULP pada 1024 seribu kali lebih
    /// besar daripada satu ULP pada 1.
    public static func langkahUlp(_ x: Double) -> Double {
        guard x.isFinite else { return .nan }
        let a = abs(x)
        if a == 0.0 {
            // Nol tidak punya ULP yang bermakna; dipakai bilangan subnormal
            // terkecil, yaitu langkah sesungguhnya dari nol.
            return Double(bitPattern: 1)
        }
        return Double(bitPattern: a.bitPattern + 1) - a
    }
}
