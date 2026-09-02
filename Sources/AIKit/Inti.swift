/// Algoritma inti mata kuliah, ditulis ulang dari rumusnya.
///
/// # Kenapa ditulis ulang, bukan disalin
///
/// Algoritma yang sama sudah ada dalam Rust, Go, PL/SQL, dan Lua di proyek
/// lain. Menyalinnya ke Swift tidak akan menambah apa pun: salinan mewarisi
/// seluruh cacat aslinya, sehingga mengadu keduanya tidak membuktikan apa-apa.
/// Yang ditulis di sini berangkat dari rumus di modul kuliahnya, lalu diadu
/// terhadap vektor uji yang sama.
///
/// # Kenapa urutan operasinya tidak boleh dirapikan
///
/// `a + b * (1 - a)` tidak boleh disederhanakan menjadi `a + b - a * b`
/// sekalipun keduanya setara secara aljabar. Pada aritmetika IEEE-754 keduanya
/// menghasilkan bit yang berbeda, dan perbedaan itulah yang sedang diukur.
///
/// .Deckyx

#if canImport(Glibc)
import Glibc
#elseif canImport(Darwin)
import Darwin
#elseif canImport(WASILibc)
import WASILibc
#endif

// ---------------------------------------------------------------------------
// Pembangkit acak
// ---------------------------------------------------------------------------

/// SplitMix64: pembangkit acak deterministik.
///
/// Dipakai mengacak urutan soal. Benih yang sama wajib menghasilkan urutan yang
/// sama persis, karena sesi latihan yang bisa diulang jauh lebih berguna
/// daripada yang berubah tiap kali dibuka — mahasiswa perlu bisa mengulang
/// soal yang sama setelah mempelajari kesalahannya.
public struct SplitMix64 {
    private var keadaan: UInt64

    public init(benih: UInt64 = 0) {
        keadaan = benih
    }

    /// Bilangan 64-bit berikutnya.
    public mutating func berikutU64() -> UInt64 {
        keadaan = keadaan &+ 0x9E37_79B9_7F4A_7C15
        var z = keadaan
        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
        return z ^ (z >> 31)
    }

    /// Pecahan berikutnya di rentang setengah terbuka `[0, 1)`.
    ///
    /// Memakai 53 bit teratas, yaitu tepat sebanyak bit mantissa `Double`.
    /// Mengambil lebih banyak tidak menambah ketelitian; mengambil lebih
    /// sedikit meninggalkan celah yang tidak pernah terpilih.
    public mutating func berikutF64() -> Double {
        Double(berikutU64() >> 11) * (1.0 / 9_007_199_254_740_992.0)
    }

    /// Bilangan bulat di rentang `0..<n`, tanpa bias pembagian sisa.
    public mutating func dibawah(_ n: UInt64) -> UInt64 {
        guard n > 0 else { return 0 }
        // Perkalian lebar lalu ambil paruh atasnya. Memakai sisa pembagian
        // akan memberi peluang lebih besar pada nilai-nilai awal, dan biasnya
        // tidak akan pernah terlihat pada mata telanjang.
        let hasil = berikutU64().multipliedFullWidth(by: n)
        return hasil.high
    }

    /// Mengacak isi sebuah larik di tempat.
    public mutating func acak<T>(_ isi: inout [T]) {
        guard isi.count > 1 else { return }
        for i in stride(from: isi.count - 1, to: 0, by: -1) {
            let j = Int(dibawah(UInt64(i + 1)))
            isi.swapAt(i, j)
        }
    }
}

// ---------------------------------------------------------------------------
// Certainty factor
// ---------------------------------------------------------------------------

/// Certainty factor seperti yang dipakai sistem pakar MYCIN.
public enum CertaintyFactor {
    public static let eps = 1e-9

    public enum Galat: Error, Equatable {
        case diLuarRentang(String)
    }

    static func periksaKepercayaan(_ v: Double, _ nama: String) throws -> Double {
        guard v.isFinite, v >= -eps, v <= 1.0 + eps else {
            throw Galat.diLuarRentang(nama)
        }
        return min(max(v, 0.0), 1.0)
    }

    static func periksaCf(_ v: Double, _ nama: String) throws -> Double {
        guard v.isFinite, v >= -1.0 - eps, v <= 1.0 + eps else {
            throw Galat.diLuarRentang(nama)
        }
        return min(max(v, -1.0), 1.0)
    }

    /// `CF = MB - MD`.
    public static func dariMbMd(_ mb: Double, _ md: Double) throws -> Double {
        try periksaKepercayaan(mb, "MB") - (try periksaKepercayaan(md, "MD"))
    }

    /// Menggabungkan dua CF dari bukti berbeda untuk hipotesis yang sama.
    public static func gabungParalel(_ cf1: Double, _ cf2: Double) throws -> Double {
        let a = try periksaCf(cf1, "CF pertama")
        let b = try periksaCf(cf2, "CF kedua")
        let hasil: Double
        if a >= 0.0 && b >= 0.0 {
            hasil = a + b * (1.0 - a)
        } else if a <= 0.0 && b <= 0.0 {
            hasil = a + b * (1.0 + a)
        } else {
            let penyebut = 1.0 - min(abs(a), abs(b))
            // Bukti berlawanan penuh (+1 lawan -1) saling meniadakan.
            hasil = abs(penyebut) < eps ? 0.0 : (a + b) / penyebut
        }
        return min(max(hasil, -1.0), 1.0)
    }

    /// CF kesimpulan = CF aturan dikali CF bukti.
    ///
    /// Bukti dengan CF negatif tidak menyalakan aturan, jadi hasilnya nol.
    public static func gabungBerantai(_ cfAturan: Double, _ cfBukti: Double) throws -> Double {
        let r = try periksaCf(cfAturan, "CF aturan")
        let e = try periksaCf(cfBukti, "CF bukti")
        return min(max(r * max(e, 0.0), -1.0), 1.0)
    }

    /// CF gabungan premis yang dihubungkan DAN — diambil nilai terkecil.
    public static func premisDan(_ a: Double, _ b: Double) throws -> Double {
        min(try periksaCf(a, "premis"), try periksaCf(b, "premis"))
    }

    /// CF gabungan premis yang dihubungkan ATAU — diambil nilai terbesar.
    public static func premisAtau(_ a: Double, _ b: Double) throws -> Double {
        max(try periksaCf(a, "premis"), try periksaCf(b, "premis"))
    }
}

// ---------------------------------------------------------------------------
// Bayesian
// ---------------------------------------------------------------------------

/// Teorema Bayes untuk kasus dua hipotesis.
public enum Bayes {
    public static let eps = 1e-9

    public enum Galat: Error, Equatable {
        case diLuarRentang(String)
        case buktiMustahil
    }

    static func periksaPeluang(_ v: Double, _ nama: String) throws -> Double {
        guard v.isFinite, v >= -eps, v <= 1.0 + eps else {
            throw Galat.diLuarRentang(nama)
        }
        return min(max(v, 0.0), 1.0)
    }

    /// Peluang munculnya bukti, `P(E)`.
    public static func bukti(prior: Double, kemungkinanH: Double, kemungkinanBukanH: Double) throws -> Double {
        let pH = try periksaPeluang(prior, "P(H)")
        let pEH = try periksaPeluang(kemungkinanH, "P(E|H)")
        let pEN = try periksaPeluang(kemungkinanBukanH, "P(E|~H)")
        let pNH = 1.0 - pH
        let ev = pH * pEH + pNH * pEN
        guard ev >= eps else { throw Galat.buktiMustahil }
        return ev
    }

    /// Posterior `P(H|E)`.
    public static func posterior(prior: Double, kemungkinanH: Double, kemungkinanBukanH: Double) throws -> Double {
        let pH = try periksaPeluang(prior, "P(H)")
        let pEH = try periksaPeluang(kemungkinanH, "P(E|H)")
        let ev = try bukti(prior: prior, kemungkinanH: kemungkinanH, kemungkinanBukanH: kemungkinanBukanH)
        return min(max(pEH * pH / ev, 0.0), 1.0)
    }

    /// Rasio kemungkinan `P(E|H) / P(E|~H)`.
    public static func rasioKemungkinan(_ kemungkinanH: Double, _ kemungkinanBukanH: Double) throws -> Double {
        let a = try periksaPeluang(kemungkinanH, "P(E|H)")
        let b = try periksaPeluang(kemungkinanBukanH, "P(E|~H)")
        if b < eps {
            return a < eps ? 0.0 : .infinity
        }
        return a / b
    }
}

// ---------------------------------------------------------------------------
// Keanggotaan kabur
// ---------------------------------------------------------------------------

/// Fungsi keanggotaan himpunan kabur.
///
/// Puncak dan bahu datar diperiksa **sebelum** tepi. Kalau tidak, himpunan
/// berkaki berimpit seperti segitiga `(0, 0, 15)` akan bernilai nol tepat di
/// tempat ia seharusnya bernilai satu — dan bentuk seperti itu justru yang
/// paling lazim dipakai di tepi semesta pembicaraan.
public enum Kabur {
    public static let eps = 1e-9

    static func batasi01(_ v: Double) -> Double { min(max(v, 0.0), 1.0) }

    public static func segitiga(_ a: Double, _ b: Double, _ c: Double, _ x: Double) -> Double {
        let v: Double
        if abs(x - b) < eps {
            v = 1.0
        } else if x <= a || x >= c {
            v = 0.0
        } else if x < b {
            v = abs(b - a) < eps ? 1.0 : (x - a) / (b - a)
        } else if abs(c - b) < eps {
            v = 1.0
        } else {
            v = (c - x) / (c - b)
        }
        return batasi01(v)
    }

    public static func trapesium(_ a: Double, _ b: Double, _ c: Double, _ d: Double, _ x: Double) -> Double {
        let v: Double
        if x >= b && x <= c {
            v = 1.0
        } else if x <= a || x >= d {
            v = 0.0
        } else if x < b {
            v = abs(b - a) < eps ? 1.0 : (x - a) / (b - a)
        } else if abs(d - c) < eps {
            v = 1.0
        } else {
            v = (d - x) / (d - c)
        }
        return batasi01(v)
    }

    public static func gauss(_ rerata: Double, _ sigma: Double, _ x: Double) -> Double {
        let s = abs(sigma) < eps ? eps : abs(sigma)
        let z = (x - rerata) / s
        return batasi01(exp(-0.5 * z * z))
    }

    public static func sigmoid(_ a: Double, _ c: Double, _ x: Double) -> Double {
        batasi01(1.0 / (1.0 + exp(-a * (x - c))))
    }
}

// ---------------------------------------------------------------------------
// Ukuran jarak dan ketakmurnian
// ---------------------------------------------------------------------------

/// Ukuran jarak, entropi, dan perolehan informasi.
public enum Ml {
    public static func euclidean(_ a: [Double], _ b: [Double]) -> Double {
        var jumlah = 0.0
        for i in 0..<min(a.count, b.count) {
            let d = a[i] - b[i]
            jumlah += d * d
        }
        return jumlah.squareRoot()
    }

    public static func manhattan(_ a: [Double], _ b: [Double]) -> Double {
        var jumlah = 0.0
        for i in 0..<min(a.count, b.count) {
            jumlah += abs(a[i] - b[i])
        }
        return jumlah
    }

    public static func chebyshev(_ a: [Double], _ b: [Double]) -> Double {
        var maks = 0.0
        for i in 0..<min(a.count, b.count) {
            maks = max(maks, abs(a[i] - b[i]))
        }
        return maks
    }

    /// Menghitung frekuensi tiap label, dikembalikan berurutan menaik.
    ///
    /// Urutan menaik bukan demi kerapian: penjumlahan pecahan tidak asosiatif,
    /// sehingga urutan yang berbeda menghasilkan bit terakhir yang berbeda.
    /// Implementasi Rust yang menjadi acuan memakai peta terurut, jadi urutan
    /// itu bagian dari spesifikasinya.
    static func cacah(_ label: [String]) -> [(String, Int)] {
        var jumlah: [String: Int] = [:]
        for l in label {
            jumlah[l, default: 0] += 1
        }
        return jumlah.keys.sorted().map { ($0, jumlah[$0]!) }
    }

    /// Entropi Shannon sebuah sebaran label, dalam bit.
    public static func entropi(_ label: [String]) -> Double {
        guard !label.isEmpty else { return 0.0 }
        let n = Double(label.count)
        var akum = 0.0
        for (_, c) in cacah(label) {
            let p = Double(c) / n
            akum += p * log2(p)
        }
        return -akum
    }

    /// Ketakmurnian Gini sebuah sebaran label.
    ///
    /// Berbeda dengan entropi, Gini hanya memakai perkalian dan pengurangan,
    /// sehingga hasilnya wajib identik bit demi bit di bahasa mana pun.
    public static func gini(_ label: [String]) -> Double {
        guard !label.isEmpty else { return 0.0 }
        let n = Double(label.count)
        var akum = 0.0
        for (_, c) in cacah(label) {
            let p = Double(c) / n
            akum += p * p
        }
        return 1.0 - akum
    }

    /// Perolehan informasi bila data dipecah menurut sebuah atribut.
    public static func perolehanInformasi(_ nilai: [String], _ label: [String]) -> Double {
        guard nilai.count == label.count, !label.isEmpty else { return 0.0 }
        let sebelum = entropi(label)
        let n = Double(label.count)

        var kelompok: [String: [String]] = [:]
        for (i, v) in nilai.enumerated() {
            kelompok[v, default: []].append(label[i])
        }

        var sesudah = 0.0
        for kunci in kelompok.keys.sorted() {
            let g = kelompok[kunci]!
            sesudah += (Double(g.count) / n) * entropi(g)
        }
        return sebelum - sesudah
    }
}
