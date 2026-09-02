/// Perkakas baris perintah AIKit.
///
/// Dua tugas, keduanya berjalan di CI dan menggagalkan build bila meleset:
///
///   `conform`  mengadu mesin Swift terhadap vektor uji berpola bit yang
///              dihasilkan implementasi Rust. Swift menjadi implementasi
///              kelima setelah Rust, Go, PL/SQL, dan Lua.
///
///   `bank`     menuliskan bank soal sebagai JSON untuk dipakai situsnya.
///              Kunci jawaban soal berhitung dihasilkan modul `Inti` yang
///              sama yang baru saja diadu — jadi kunci yang melenceng dari
///              algoritmanya mustahil lolos tanpa menggagalkan `conform`.
///
/// .Deckyx

#if canImport(Glibc)
import Glibc
#elseif canImport(Darwin)
import Darwin
#endif

import AIKit

// ---------------------------------------------------------------------------
// Berkas
// ---------------------------------------------------------------------------

/// Membaca seluruh isi sebuah berkas teks.
///
/// Ditulis dengan `fopen` alih-alih `String(contentsOfFile:)` supaya paket ini
/// tidak menarik Foundation. Lihat catatan di `Package.swift`.
func bacaBerkas(_ jalur: String) -> String? {
    guard let f = fopen(jalur, "rb") else { return nil }
    defer { fclose(f) }
    var isi = [UInt8]()
    var penyangga = [UInt8](repeating: 0, count: 1 << 16)
    while true {
        let n = fread(&penyangga, 1, penyangga.count, f)
        if n <= 0 { break }
        isi.append(contentsOf: penyangga[0..<n])
    }
    return String(decoding: isi, as: UTF8.self)
}

/// Menuliskan teks ke sebuah berkas.
func tulisBerkas(_ jalur: String, _ isi: String) -> Bool {
    guard let f = fopen(jalur, "wb") else { return false }
    defer { fclose(f) }
    let bytes = Array(isi.utf8)
    return fwrite(bytes, 1, bytes.count, f) == bytes.count
}

/// Memecah teks menjadi baris, menerima akhiran baris Windows maupun Unix.
func baris(_ teks: String) -> [String] {
    teks.split(whereSeparator: { $0 == "\n" })
        .map { pangkas(String($0)) }
        .filter { !$0.isEmpty }
}

/// Memecah sebaris teks menurut tab.
func kolom(_ b: String) -> [String] {
    b.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
}

// ---------------------------------------------------------------------------
// Konformansi
// ---------------------------------------------------------------------------

struct HasilBerkas {
    var nama: String
    var keterbandingan: String
    var diperiksa = 0
    var gagal = 0
    var ulpMaks: UInt64 = 0
}

struct Ketidakcocokan {
    var berkas: String
    var baris: Int
    var konteks: String
    var harap: String
    var dapat: String
    var ulp: UInt64?
}

/// Menjalankan seluruh berkas vektor di sebuah direktori.
func jalankanKonformansi(direktori: String) -> (berkas: [HasilBerkas], gagal: [Ketidakcocokan], total: Int) {
    // Nama berkasnya ditulis tetap, bukan dipindai direktori. Berkas yang
    // hilang harus menggagalkan jalannya, bukan diam-diam mengurangi jumlah
    // pernyataan yang diperiksa — dan pemindaian direktori tidak bisa
    // membedakan keduanya.
    let daftar = [
        "bayes.tsv", "certainty.tsv", "fuzzy_linear.tsv", "fuzzy_transcendental.tsv",
        "fx.tsv", "ml_entropy.tsv", "ml_exact.tsv", "ml_gain.tsv", "rng.tsv",
    ]

    var hasil: [HasilBerkas] = []
    var gagal: [Ketidakcocokan] = []
    var total = 0

    for nama in daftar {
        guard let isi = bacaBerkas("\(direktori)/\(nama)") else {
            Galat.tulis("Berkas vektor tidak terbaca: \(direktori)/\(nama)\n")
            exit(2)
        }

        var tingkat: Keterbandingan?
        var isiBaris: [[String]] = []
        for b in baris(isi) {
            if b.hasPrefix("#") {
                let komentar = pangkas(String(b.dropFirst()))
                if komentar.hasPrefix("keterbandingan:") {
                    let penanda = String(komentar.dropFirst("keterbandingan:".count))
                    tingkat = Keterbandingan(penanda: penanda)
                }
            } else {
                isiBaris.append(kolom(b))
            }
        }

        guard let k = tingkat else {
            Galat.tulis("\(nama): tidak menyebutkan tingkat keterbandingan\n")
            exit(2)
        }

        var ringkas = HasilBerkas(nama: nama, keterbandingan: k.nama)

        func nilai(_ harap: Double, _ dapat: Double, _ konteks: String, _ nomor: Int, skala: Double? = nil) {
            ringkas.diperiksa += 1
            total += 1
            if let d = Fx.jarakUlp(harap, dapat), d > ringkas.ulpMaks {
                ringkas.ulpMaks = d
            }
            if !k.terpenuhi(harap, dapat, skala: skala) {
                ringkas.gagal += 1
                if gagal.count < 25 {
                    gagal.append(Ketidakcocokan(
                        berkas: nama, baris: nomor, konteks: konteks,
                        harap: Fx.keHex(harap), dapat: Fx.keHex(dapat),
                        ulp: Fx.jarakUlp(harap, dapat)))
                }
            }
        }

        func nilaiTeks(_ harap: String, _ dapat: String, _ konteks: String, _ nomor: Int) {
            ringkas.diperiksa += 1
            total += 1
            if harap != dapat {
                ringkas.gagal += 1
                if gagal.count < 25 {
                    gagal.append(Ketidakcocokan(
                        berkas: nama, baris: nomor, konteks: konteks,
                        harap: harap, dapat: dapat, ulp: nil))
                }
            }
        }

        for (i, kol) in isiBaris.enumerated() {
            let nomor = i + 1
            do {
                try periksaBaris(nama: nama, kol: kol, nomor: nomor, nilai: nilai, nilaiTeks: nilaiTeks)
            } catch {
                Galat.tulis("\(nama) baris \(nomor): \(error)\n")
                exit(2)
            }
        }

        hasil.append(ringkas)
    }

    return (hasil, gagal, total)
}

/// Memeriksa satu baris vektor.
func periksaBaris(
    nama: String,
    kol: [String],
    nomor: Int,
    nilai: (Double, Double, String, Int, Double?) -> Void,
    nilaiTeks: (String, String, String, Int) -> Void
) throws {
    let h = Fx.dariHex

    switch nama {
    case "fx.tsv":
        // Dibandingkan sebagai **teks**, bukan sebagai nilai. Membandingkan
        // nilai hasil bolak-balik dengan nilai asalnya adalah membandingkan
        // sesuatu dengan dirinya sendiri: kerusakan yang setangkup di kedua
        // arah — tanda nol negatif yang hilang saat dibaca dan karena itu tidak
        // pernah dituliskan kembali — akan lolos setiap kali.
        nilaiTeks(kol[1], Fx.keHex(try h(kol[1])), "bolak-balik \(kol[0])", nomor)

    case "rng.tsv":
        guard let benih = UInt64(kol[0]), let indeks = Int(kol[1]) else {
            throw Fx.GalatHex.bukanHeksadesimal(kol[0])
        }
        var r = SplitMix64(benih: benih)
        var u: UInt64 = 0
        for _ in 0...indeks { u = r.berikutU64() }
        nilai(try h(kol[2]), Double(bitPattern: u), "next_u64 benih \(kol[0]) indeks \(indeks)", nomor, nil)

        var rf = SplitMix64(benih: benih)
        var f = 0.0
        for _ in 0...indeks { f = rf.berikutF64() }
        nilai(try h(kol[3]), f, "next_f64 benih \(kol[0]) indeks \(indeks)", nomor, nil)

    case "certainty.tsv":
        let a = try h(kol[1])
        let b = try h(kol[2])
        let dapat: Double
        switch kol[0] {
        case "parallel": dapat = try CertaintyFactor.gabungParalel(a, b)
        case "sequential": dapat = try CertaintyFactor.gabungBerantai(a, b)
        case "and": dapat = try CertaintyFactor.premisDan(a, b)
        case "or": dapat = try CertaintyFactor.premisAtau(a, b)
        case "mb_md": dapat = try CertaintyFactor.dariMbMd(a, b)
        default: throw Fx.GalatHex.bukanHeksadesimal(kol[0])
        }
        nilai(try h(kol[3]), dapat, "\(kol[0])(\(kol[1]), \(kol[2]))", nomor, nil)

    case "bayes.tsv":
        let prior = try h(kol[0])
        let lh = try h(kol[1])
        let lnh = try h(kol[2])
        nilai(try h(kol[3]), try Bayes.bukti(prior: prior, kemungkinanH: lh, kemungkinanBukanH: lnh), "P(E)", nomor, nil)
        nilai(try h(kol[4]), try Bayes.posterior(prior: prior, kemungkinanH: lh, kemungkinanBukanH: lnh), "posterior", nomor, nil)
        nilai(try h(kol[5]), try Bayes.rasioKemungkinan(lh, lnh), "rasio kemungkinan", nomor, nil)

    case "fuzzy_linear.tsv":
        let p1 = try h(kol[1]), p2 = try h(kol[2]), p3 = try h(kol[3])
        let p4 = try h(kol[4]), x = try h(kol[5])
        let dapat: Double
        switch kol[0] {
        case "triangular": dapat = Kabur.segitiga(p1, p2, p3, x)
        case "trapezoidal": dapat = Kabur.trapesium(p1, p2, p3, p4, x)
        default: throw Fx.GalatHex.bukanHeksadesimal(kol[0])
        }
        nilai(try h(kol[6]), dapat, "\(kol[0]) di x=\(kol[5])", nomor, nil)

    case "fuzzy_transcendental.tsv":
        let p1 = try h(kol[1]), p2 = try h(kol[2]), x = try h(kol[3])
        let dapat: Double
        switch kol[0] {
        case "gaussian": dapat = Kabur.gauss(p1, p2, x)
        case "sigmoid": dapat = Kabur.sigmoid(p1, p2, x)
        default: throw Fx.GalatHex.bukanHeksadesimal(kol[0])
        }
        nilai(try h(kol[4]), dapat, "\(kol[0]) di x=\(kol[3])", nomor, nil)

    case "ml_exact.tsv":
        if kol[0] == "gini" {
            nilai(try h(kol[5]), Ml.gini(pisahKoma(kol[1])), "gini \(kol[1])", nomor, nil)
        } else {
            let a = [try h(kol[1]), try h(kol[2])]
            let b = [try h(kol[3]), try h(kol[4])]
            let dapat: Double
            switch kol[0] {
            case "euclidean": dapat = Ml.euclidean(a, b)
            case "manhattan": dapat = Ml.manhattan(a, b)
            case "chebyshev": dapat = Ml.chebyshev(a, b)
            default: throw Fx.GalatHex.bukanHeksadesimal(kol[0])
            }
            nilai(try h(kol[5]), dapat, kol[0], nomor, nil)
        }

    case "ml_entropy.tsv":
        nilai(try h(kol[3]), Ml.entropi(pisahKoma(kol[1])), "entropi \(kol[1])", nomor, nil)

    case "ml_gain.tsv":
        let label = pisahKoma(kol[1])
        guard let pisah = kol[2].firstIndex(of: "=") else {
            throw Fx.GalatHex.bukanHeksadesimal(kol[2])
        }
        let atribut = String(kol[2][kol[2].startIndex..<pisah])
        let isi = String(kol[2][kol[2].index(after: pisah)...])
        // Kolom skala memuat entropi sebelum pemecahan, yaitu tempat
        // aritmetikanya sesungguhnya terjadi.
        nilai(try h(kol[4]), Ml.perolehanInformasi(pisahKoma(isi), label),
              "perolehan \(atribut)", nomor, try h(kol[3]))

    default:
        throw Fx.GalatHex.bukanHeksadesimal(nama)
    }
}

func pisahKoma(_ s: String) -> [String] {
    s.split(separator: ",").map(String.init).filter { !$0.isEmpty }
}

// ---------------------------------------------------------------------------
// Keluaran
// ---------------------------------------------------------------------------

/// Menulis ke aliran galat.
///
/// `stderr` adalah peubah global C yang bisa berubah, sehingga Swift 6
/// menolaknya dari konteks yang diperiksa keselamatan konkurensinya. Ia
/// diambil ulang tiap pemanggilan lewat `fdopen` pada deskriptor 2 — nomor
/// yang memang ditetapkan POSIX untuk aliran galat, dan karenanya tetap dan
/// aman dibaca dari mana pun.
enum Galat {
    static func tulis(_ s: String) {
        guard let aliran = fdopen(2, "w") else { return }
        fputs(s, aliran)
        fflush(aliran)
    }
}

func rata(_ s: String, _ lebar: Int) -> String {
    s.count >= lebar ? s : s + String(repeating: " ", count: lebar - s.count)
}

func kanan(_ s: String, _ lebar: Int) -> String {
    s.count >= lebar ? s : String(repeating: " ", count: lebar - s.count) + s
}

// ---------------------------------------------------------------------------
// Bank soal sebagai JSON
// ---------------------------------------------------------------------------

/// Melarikan teks agar aman dimasukkan ke JSON.
///
/// Ditulis sendiri karena paket ini tidak memakai Foundation. Yang dilarikan
/// bukan hanya tanda kutip dan garis miring terbalik: karakter kendali di
/// bawah 0x20 wajib ditulis sebagai `\u00XX`, dan melewatkannya menghasilkan
/// JSON yang terlihat benar tetapi ditolak pengurai mana pun.
func jsonTeks(_ s: String) -> String {
    var keluar = "\""
    for skalar in s.unicodeScalars {
        switch skalar {
        case "\"": keluar += "\\\""
        case "\\": keluar += "\\\\"
        case "\n": keluar += "\\n"
        case "\r": keluar += "\\r"
        case "\t": keluar += "\\t"
        default:
            if skalar.value < 0x20 {
                var hex = String(skalar.value, radix: 16)
                while hex.count < 4 { hex = "0" + hex }
                keluar += "\\u" + hex
            } else {
                keluar.unicodeScalars.append(skalar)
            }
        }
    }
    return keluar + "\""
}

/// Menuliskan angka dengan ketelitian penuh.
///
/// Interpolasi teks bawaan Swift sudah menghasilkan bentuk terpendek yang
/// bisa dibaca kembali menjadi `Double` yang sama persis. Tidak perlu
/// `snprintf` dengan `%.17g`: yang itu selalu mencetak 17 digit, termasuk
/// ekor derau seperti `0.79000000000000004` yang benar tetapi mengotori
/// berkas kunci jawaban tanpa menambah ketelitian apa pun.
func jsonAngka(_ v: Double) -> String {
    v.isFinite ? String(v) : "null"
}

func bankKeJson() -> String {
    var keluar = "{\n"
    keluar += "  \"sesi\": [\n"
    keluar += Bank.sesi.map { s in
        "    { \"nomor\": \(s.nomor), \"nama\": \(jsonTeks(s.nama)) }"
    }.joined(separator: ",\n")
    keluar += "\n  ],\n"
    keluar += "  \"soal\": [\n"

    keluar += Bank.semua.map { s in
        var bentuk = ""
        switch s.bentuk {
        case let .pilihan(pilihan, benar):
            let daftar = pilihan.map(jsonTeks).joined(separator: ", ")
            bentuk = "\"bentuk\": \"pilihan\", \"pilihan\": [\(daftar)], \"benar\": \(benar)"
        case let .angka(jawaban, toleransi, satuan):
            bentuk = "\"bentuk\": \"angka\", \"jawaban\": \(jsonAngka(jawaban)), "
                + "\"toleransi\": \(jsonAngka(toleransi)), \"satuan\": \(jsonTeks(satuan))"
        case let .benarSalah(benar):
            bentuk = "\"bentuk\": \"benarSalah\", \"benar\": \(benar)"
        }
        return "    {\n"
            + "      \"kode\": \(jsonTeks(s.kode)), \"sesi\": \(s.sesi), "
            + "\"topik\": \(jsonTeks(s.topik)), \"tingkat\": \(s.tingkat),\n"
            + "      \"pertanyaan\": \(jsonTeks(s.pertanyaan)),\n"
            + "      \(bentuk),\n"
            + "      \"pembahasan\": \(jsonTeks(s.pembahasan))\n"
            + "    }"
    }.joined(separator: ",\n")

    keluar += "\n  ]\n}\n"
    return keluar
}

// ---------------------------------------------------------------------------
// Titik masuk
// ---------------------------------------------------------------------------

let argumen = CommandLine.arguments

guard argumen.count >= 2 else {
    print("Pemakaian: aikit-cli conform <direktori-vektor>")
    print("           aikit-cli bank <berkas-keluaran.json>")
    exit(64)
}

switch argumen[1] {
case "conform":
    let dir = argumen.count > 2 ? argumen[2] : "conformance/vectors"
    let (berkas, gagal, total) = jalankanKonformansi(direktori: dir)

    print("Konformansi Swift terhadap vektor Rust — ind323-ai-lab .Deckyx")
    print(String(repeating: "=", count: 74))
    var totalGagal = 0
    for f in berkas {
        totalGagal += f.gagal
        let status = f.gagal == 0 ? "ok" : "\(f.gagal) GAGAL"
        print("\(rata(f.nama, 26))\(kanan(String(f.diperiksa), 6)) diperiksa  "
            + "\(rata(f.keterbandingan, 24))ULP maks \(kanan(String(f.ulpMaks), 3))  \(status)")
    }
    print(String(repeating: "=", count: 74))

    if totalGagal > 0 {
        print("\(totalGagal) ketidakcocokan (paling banyak 25 baris pertama):")
        for g in gagal {
            let ulp = g.ulp.map { "  ULP \($0)" } ?? ""
            print("  \(rata("\(g.berkas):\(g.baris)", 26))\(rata(g.konteks, 30))"
                + "harap \(g.harap)  dapat \(g.dapat)\(ulp)")
        }
        exit(1)
    }

    // Jalan tanpa satu pun pernyataan bukan keberhasilan melainkan tanda
    // vektornya tidak terbaca. Tanpa pemeriksaan ini, CI akan hijau justru
    // ketika ujinya tidak ada.
    if total == 0 {
        Galat.tulis("Tidak ada satu pun pernyataan yang diperiksa.\n")
        exit(2)
    }
    print("Seluruh \(total) pernyataan cocok antara Swift dan Rust.")

case "sesi":
    // Mencetak kode soal sebuah sesi berbenih tertentu, satu per baris.
    //
    // Dipakai uji sisi peramban untuk memastikan pengacakannya sepadan bit
    // demi bit dengan Swift. Sesi yang berbeda antara yang disusun Swift dan
    // yang disusun peramban akan meruntuhkan seluruh gagasan "sesi yang bisa
    // diulang", dan bedanya tidak akan terlihat tanpa dibandingkan langsung.
    do {
        let benih = argumen.count > 2 ? (UInt64(argumen[2]) ?? 0) : 0
        let banyak = argumen.count > 3 ? (Int(argumen[3]) ?? 10) : 10
        let sesi = PenyusunSesi.susun(bank: Bank.semua, banyak: banyak, benih: benih)
        for soal in sesi.soal {
            var baris = soal.kode
            if case let .pilihan(pilihan, benar) = soal.bentuk {
                baris += " :: " + String(benar) + " :: " + pilihan.joined(separator: "|")
            }
            print(baris)
        }
    }

case "jadwal":
    // Mencetak jejak penjadwal SM-2 sebagai TSV.
    //
    // Dipakai uji sisi peramban untuk memastikan penjadwal yang digambar
    // halaman sepadan dengan penjadwal yang benar-benar dipakai. Kurva yang
    // digambar dari salinan yang menyimpang mengajarkan algoritma yang bukan
    // algoritma situs ini — dan justru kurva itulah yang akan dipercaya
    // pembaca, karena kode Swift-nya tidak pernah ia lihat.
    //
    // Kolom: mutu  ulangan  jarakHari  kemudahan
    do {
        print("# jejak SM-2 dari Swift — ind323-ai-lab .Deckyx")
        print("# jangan disunting tangan; hasilkan ulang dengan 'aikit-cli jadwal'")

        // Deret mutu yang diuji dipilih untuk menyentuh tiap cabang: menaik
        // mulus, satu kegagalan di tengah deret panjang, kegagalan beruntun
        // sampai kemudahannya menyentuh batas bawah, dan mutu di kedua ujung
        // rentang yang sah.
        let deret: [(String, [Int])] = [
            ("sempurna", Array(repeating: 5, count: 12)),
            ("lancar", Array(repeating: 4, count: 12)),
            ("pas-pasan", Array(repeating: 3, count: 12)),
            ("tersandung", [5, 5, 5, 5, 2, 5, 5, 5, 5, 4, 4, 4]),
            ("berkali-salah", Array(repeating: 0, count: 10) + [5, 5, 5, 5, 5, 5]),
            ("selang-seling", [5, 0, 5, 0, 5, 0, 4, 3, 4, 3, 5, 2]),
            ("di-luar-rentang", [7, -3, 5, 9, 0, 4]),
        ]

        for (nama, mutuDeret) in deret {
            var h = Hafalan(kode: nama)
            print("== \(nama)")
            for mutu in mutuDeret {
                h = Penjadwal.perbarui(h, mutu: mutu)
                print("\(mutu)\t\(h.ulangan)\t\(h.jarakHari)\t\(Fx.keHex(h.kemudahan))")
            }
        }

        // Pemetaan hasil penilaian menjadi mutu, dengan waktu di sekitar
        // setiap ambangnya.
        print("== mutu")
        for batas in [90, 60, 1, 0] {
            for detik in [0, 1, batas / 3, batas / 3 + 1, batas * 2 / 3,
                          batas * 2 / 3 + 1, batas - 1, batas, batas + 5] {
                for benar in [true, false] {
                    let m = Penjadwal.mutu(benar: benar, detik: detik, batasDetik: batas)
                    print("\(benar ? 1 : 0)\t\(detik)\t\(batas)\t\(m)")
                }
            }
        }
    }

case "bank":
    guard argumen.count > 2 else {
        Galat.tulis("Sebutkan berkas keluarannya.\n")
        exit(64)
    }
    let json = bankKeJson()
    guard tulisBerkas(argumen[2], json) else {
        Galat.tulis("Gagal menulis \(argumen[2]).\n")
        exit(2)
    }
    print("\(Bank.semua.count) soal dari \(Bank.sesi.count) sesi ditulis ke \(argumen[2]).")

default:
    Galat.tulis("Perintah tidak dikenal: \(argumen[1])\n")
    exit(64)
}
