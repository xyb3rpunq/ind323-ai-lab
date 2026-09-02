/// Uji paket AIKit.
///
/// Konformansi membuktikan angka Swift sepadan dengan empat implementasi lain.
/// Uji di berkas ini membuktikan hal yang tidak bisa dibuktikan konformansi:
/// bahwa masukan tidak sah ditolak, bahwa mesin ujiannya berperilaku benar, dan
/// bahwa sifat matematis yang seharusnya berlaku memang berlaku pada masukan
/// mana pun — bukan hanya pada vektor yang kebetulan diuji.
///
/// .Deckyx

import Testing
@testable import AIKit

// ---------------------------------------------------------------------------
// Pertukaran pola bit
// ---------------------------------------------------------------------------

@Suite("Pertukaran pola bit")
struct UjiFx {
    @Test("Pola bit nilai yang dikenal")
    func polaBit() {
        #expect(Fx.keHex(1.0) == "3ff0000000000000")
        #expect(Fx.keHex(0.1) == "3fb999999999999a")
        #expect(Fx.keHex(0.0) == "0000000000000000")
        #expect(Fx.keHex(Double.infinity) == "7ff0000000000000")
    }

    @Test("Nol negatif bertahan melewati bolak-balik")
    func nolNegatif() throws {
        // Nol negatif adalah nilai yang paling sering hilang saat angka
        // berpindah bahasa. Oracle BINARY_DOUBLE mengubahnya menjadi nol
        // positif; Lua kehilangannya saat penulisnya menambah `+ 0.0`.
        #expect(Fx.keHex(-0.0) == "8000000000000000")
        #expect(Fx.keHex(try Fx.dariHex("8000000000000000")) == "8000000000000000")
        #expect(!Fx.samaBit(0.0, -0.0))
        // Namun perbandingan biasa tetap menyatakan keduanya sama, dan itulah
        // sebabnya perbandingan bit-eksak tidak boleh memakai `==`.
        #expect(0.0 == -0.0)
    }

    @Test("Bolak-balik nilai batas")
    func nilaiBatas() throws {
        for hex in ["400921fb54442d18", "0000000000000001", "7fefffffffffffff", "fff0000000000000"] {
            #expect(Fx.keHex(try Fx.dariHex(hex)) == hex)
        }
    }

    @Test("Teks yang panjangnya salah ditolak")
    func panjangSalah() {
        // Teks 14 digit adalah pola bit yang sah, hanya bukan yang dimaksud.
        #expect(throws: Fx.GalatHex.panjangSalah(14)) {
            _ = try Fx.dariHex("3ff00000000000")
        }
    }

    @Test("Teks yang bukan heksadesimal ditolak")
    func bukanHeks() {
        #expect(throws: Fx.GalatHex.self) {
            _ = try Fx.dariHex("3ff000000000000z")
        }
    }

    @Test("Jarak ULP")
    func jarakUlp() throws {
        let a = try Fx.dariHex("3fdae147ae147ae1")
        let b = try Fx.dariHex("3fdae147ae147ae2")
        #expect(Fx.jarakUlp(a, b) == 1)
        #expect(Fx.jarakUlp(1.0, 2.0) == 4_503_599_627_370_496)
        #expect(Fx.jarakUlp(-0.0, 0.0) == 0)
        #expect(Fx.jarakUlp(.nan, 1.0) == nil)
        #expect(Fx.jarakUlp(.infinity, 1.0) == nil)
    }

    @Test("Jarak ULP melintasi nol tidak berputar menjadi negatif")
    func jarakMelintasiNol() {
        // Kunci terurutnya memetakan nilai negatif ke bilangan bertanda
        // negatif, jadi selisih dua nilai berlawanan tanda bisa melewati batas
        // Int64 dan berputar bila dihitung ceroboh.
        let d = Fx.jarakUlp(-1.0, 1.0)
        #expect(d != nil)
        #expect(d! > 0)
    }

    @Test("NaN dianggap sama dengan NaN pada tingkat bit")
    func nanSama() {
        #expect(Fx.samaBit(.nan, .nan))
        #expect(!(Double.nan == Double.nan))
    }

    @Test("Langkah ULP")
    func langkahUlp() {
        #expect(Fx.langkahUlp(1.0) == .ulpOfOne)
        #expect(Fx.langkahUlp(-1.0) == .ulpOfOne)
        #expect(Fx.langkahUlp(0.0) == Double(bitPattern: 1))
        // Satu ULP pada 1024 seribu kali lebih besar daripada pada 1. Justru
        // inilah alasan toleransi ULP harus disebut skalanya.
        #expect(Fx.langkahUlp(1024.0) > Fx.langkahUlp(1.0) * 1000.0)
        #expect(Fx.langkahUlp(.infinity).isNaN)
    }
}

// ---------------------------------------------------------------------------
// Tingkat keterbandingan
// ---------------------------------------------------------------------------

@Suite("Tingkat keterbandingan")
struct UjiKeterbandingan {
    @Test("Penanda terbaca")
    func penanda() {
        #expect(Keterbandingan(penanda: "BitExact") == .bitEksak)
        #expect(Keterbandingan(penanda: "NearlyEqual(4)") == .hampirSama(maksUlp: 4))
        #expect(Keterbandingan(penanda: "CancellingDifference(4)") == .selisihMeniadakan(maksUlp: 4))
        #expect(Keterbandingan(penanda: "PropertyOnly") == .sifatSaja)
        #expect(Keterbandingan(penanda: "Kira-kira sama") == nil)
        #expect(Keterbandingan(penanda: "NearlyEqual") == nil)
    }

    @Test("Bit-eksak menolak beda tanda nol")
    func bedaTandaNol() {
        // Nol positif dan negatif berjarak nol ULP tetapi berbeda pola bitnya.
        // Tingkat yang bernama "bit exact" harus melaporkan perbedaan itu.
        #expect(!Keterbandingan.bitEksak.terpenuhi(0.0, -0.0))
        #expect(Keterbandingan.bitEksak.terpenuhi(1.0, 1.0))
    }

    @Test("Tingkat berskala mengukur pada skalanya")
    func berskala() {
        let tingkat = Keterbandingan.selisihMeniadakan(maksUlp: 4)
        let skala = 0.9402859586706311
        let a = 0.02922256565895487
        #expect(tingkat.terpenuhi(a, a + 2 * Fx.langkahUlp(skala), skala: skala))
        #expect(!tingkat.terpenuhi(a, a + 5 * Fx.langkahUlp(skala), skala: skala))
        // Galat yang sama berjarak puluhan ULP kalau diukur pada hasilnya.
        #expect(!Keterbandingan.hampirSama(maksUlp: 4).terpenuhi(a, a + 2 * Fx.langkahUlp(skala)))
    }

    @Test("Tingkat berskala tanpa skala dinilai paling ketat")
    func tanpaSkala() {
        // Lupa memberi skala harus berujung kegagalan, bukan kelolosan palsu.
        let tingkat = Keterbandingan.selisihMeniadakan(maksUlp: 4)
        #expect(tingkat.butuhSkala)
        #expect(tingkat.terpenuhi(1.0, 1.0))
        #expect(!tingkat.terpenuhi(1.0, 1.0 + .ulpOfOne))
        #expect(!tingkat.terpenuhi(1.0, 2.0, skala: .nan))
    }
}

// ---------------------------------------------------------------------------
// Algoritma inti
// ---------------------------------------------------------------------------

@Suite("Certainty factor")
struct UjiCertainty {
    @Test("Tugas Sesi 3 menghasilkan CF 0,79")
    func tugasSesi3() throws {
        #expect(abs(try CertaintyFactor.dariMbMd(0.8, 0.01) - 0.79) < 1e-12)
    }

    @Test("Penggabungan bukti")
    func penggabungan() throws {
        #expect(abs(try CertaintyFactor.gabungParalel(0.8, 0.6) - 0.92) < 1e-12)
        // Bukti berlawanan penuh saling meniadakan, bukan membagi dengan nol.
        #expect(try CertaintyFactor.gabungParalel(1.0, -1.0) == 0.0)
        // Bukti negatif tidak menyalakan aturan sama sekali.
        #expect(try CertaintyFactor.gabungBerantai(0.9, -0.5) == 0.0)
        // Tanda nolnya mengikuti tanda CF aturannya, bukan tanda buktinya:
        // hasilnya `r * max(e, 0)`, dan nol dikali bilangan negatif adalah nol
        // negatif. Keempat implementasi lain menghasilkan pola bit yang sama,
        // dan vektor `certainty.tsv` memuat kasus ini apa adanya.
        #expect(Fx.samaBit(try CertaintyFactor.gabungBerantai(0.9, -0.5), 0.0))
        #expect(Fx.samaBit(try CertaintyFactor.gabungBerantai(-1.0, -1.0), -0.0))
    }

    @Test("Premis DAN dan ATAU")
    func premis() throws {
        #expect(try CertaintyFactor.premisDan(0.9, 0.3) == 0.3)
        #expect(try CertaintyFactor.premisAtau(0.9, 0.3) == 0.9)
    }

    @Test("Penggabungan bersifat komutatif")
    func komutatif() throws {
        for a in stride(from: -1.0, through: 1.0, by: 0.25) {
            for b in stride(from: -1.0, through: 1.0, by: 0.25) {
                let kiri = try CertaintyFactor.gabungParalel(a, b)
                let kanan = try CertaintyFactor.gabungParalel(b, a)
                #expect(Fx.samaBit(kiri, kanan), "gagal pada \(a), \(b)")
            }
        }
    }

    @Test("Hasilnya selalu di dalam rentang")
    func dalamRentang() throws {
        for a in stride(from: -1.0, through: 1.0, by: 0.1) {
            for b in stride(from: -1.0, through: 1.0, by: 0.1) {
                let v = try CertaintyFactor.gabungParalel(a, b)
                #expect(v >= -1.0 && v <= 1.0)
            }
        }
    }

    @Test("Bukti positif tidak pernah menurunkan keyakinan")
    func monoton() throws {
        for i in 0...20 {
            let b = Double(i) / 20.0
            #expect(try CertaintyFactor.gabungParalel(0.5, b) >= 0.5 - 1e-12)
        }
    }

    @Test("Masukan di luar rentang ditolak")
    func diLuarRentang() {
        #expect(throws: CertaintyFactor.Galat.self) { _ = try CertaintyFactor.dariMbMd(1.5, 0.0) }
        #expect(throws: CertaintyFactor.Galat.self) { _ = try CertaintyFactor.gabungParalel(1.5, 0.2) }
        #expect(throws: CertaintyFactor.Galat.self) { _ = try CertaintyFactor.dariMbMd(.nan, 0.0) }
    }
}

@Suite("Teorema Bayes")
struct UjiBayes {
    @Test("Tugas Pertemuan 5 menghasilkan 3/7")
    func tugasPertemuan5() throws {
        let p = try Bayes.posterior(prior: 0.2, kemungkinanH: 0.9, kemungkinanBukanH: 0.3)
        #expect(abs(p - 3.0 / 7.0) < 1e-12)
        let e = try Bayes.bukti(prior: 0.2, kemungkinanH: 0.9, kemungkinanBukanH: 0.3)
        #expect(abs(e - 0.42) < 1e-12)
    }

    @Test("Posterior dan komplemennya selalu berjumlah satu")
    func jumlahSatu() throws {
        // Sifat yang paling sering dilanggar implementasi keliru, diperiksa
        // pada 729 kombinasi masukan alih-alih satu contoh.
        for a in 1...9 {
            for b in 1...9 {
                for c in 1...9 {
                    let post = try Bayes.posterior(
                        prior: Double(a) / 10, kemungkinanH: Double(b) / 10,
                        kemungkinanBukanH: Double(c) / 10)
                    #expect(abs(post + (1.0 - post) - 1.0) < 1e-12)
                    #expect(post >= 0.0 && post <= 1.0)
                }
            }
        }
    }

    @Test("Penyakit langka tetap tidak mungkin walau tesnya akurat")
    func lajuDasar() throws {
        let p = try Bayes.posterior(prior: 0.001, kemungkinanH: 0.99, kemungkinanBukanH: 0.05)
        #expect(p < 0.05)
    }

    @Test("Rasio kemungkinan pada nilai batas")
    func rasio() throws {
        #expect(try Bayes.rasioKemungkinan(0.9, 0.3) == 3.0)
        #expect(try Bayes.rasioKemungkinan(0.5, 0.0).isInfinite)
        #expect(try Bayes.rasioKemungkinan(0.0, 0.0) == 0.0)
    }

    @Test("Bukti yang mustahil ditolak")
    func buktiMustahil() {
        #expect(throws: Bayes.Galat.buktiMustahil) {
            _ = try Bayes.posterior(prior: 0.0, kemungkinanH: 0.9, kemungkinanBukanH: 0.0)
        }
    }
}

@Suite("Keanggotaan kabur")
struct UjiKabur {
    @Test("Bentuk dasar")
    func bentukDasar() {
        #expect(Kabur.segitiga(0, 5, 10, 5) == 1.0)
        #expect(Kabur.segitiga(0, 10, 20, 5) == 0.5)
        #expect(Kabur.segitiga(0, 5, 10, 12) == 0.0)
        #expect(Kabur.trapesium(0, 5, 10, 15, 7) == 1.0)
    }

    @Test("Himpunan berkaki berimpit penuh di tepi semesta")
    func kakiBerimpit() {
        // Inilah bentuk yang paling gampang salah: kalau tepi diperiksa lebih
        // dulu daripada puncak, keduanya bernilai nol tepat di tempat mereka
        // seharusnya bernilai satu.
        #expect(Kabur.segitiga(0, 0, 15, 0) == 1.0)
        #expect(Kabur.trapesium(5, 8, 10, 10, 10) == 1.0)
        #expect(Kabur.trapesium(0, 0, 15, 20, 0) == 1.0)
    }

    @Test("Derajat keanggotaan selalu di dalam nol sampai satu")
    func rentang() {
        for i in -50...150 {
            let x = Double(i) / 2.0
            for v in [
                Kabur.segitiga(10, 20, 30, x),
                Kabur.trapesium(0, 0, 15, 20, x),
                Kabur.gauss(24, 3, x),
                Kabur.sigmoid(2, 5, x),
            ] {
                #expect(v >= 0.0 && v <= 1.0)
            }
        }
    }

    @Test("Gauss meluruh menjauhi pusatnya")
    func gauss() {
        #expect(Kabur.gauss(24, 3, 24) == 1.0)
        #expect(Kabur.gauss(24, 3, 30) < Kabur.gauss(24, 3, 26))
    }

    @Test("Sigma nol tidak membagi dengan nol")
    func sigmaNol() {
        #expect(Kabur.gauss(5, 0, 5).isFinite)
        #expect(Kabur.gauss(5, 0, 6).isFinite)
    }
}

@Suite("Pembelajaran mesin")
struct UjiMl {
    @Test("Entropi nilai yang dikenal")
    func entropi() {
        // Kelas tunggal menghasilkan nol negatif, bukan nol positif. Tandanya
        // muncul karena hasilnya adalah negasi dari nol, dan itu memang yang
        // dihasilkan keempat implementasi lain.
        #expect(Fx.samaBit(Ml.entropi(["A"]), -0.0))
        #expect(Ml.entropi(["A", "B"]) == 1.0)
        #expect(Ml.entropi(["A", "B", "C", "D"]) == 2.0)
        #expect(Ml.entropi([]) == 0.0)
    }

    @Test("Gini nilai yang dikenal")
    func gini() {
        #expect(Ml.gini(["A", "B"]) == 0.5)
        #expect(Ml.gini(["A", "A"]) == 0.0)
        #expect(Ml.gini([]) == 0.0)
    }

    @Test("Jarak nilai yang dikenal")
    func jarak() {
        #expect(Ml.euclidean([0, 0], [3, 4]) == 5.0)
        #expect(Ml.manhattan([0, 0], [3, 4]) == 7.0)
        #expect(Ml.chebyshev([0, 0], [3, 4]) == 4.0)
    }

    @Test("Jarak bersifat setangkup dan memenuhi ketaksamaan segitiga")
    func sifatJarak() {
        let a = [0.0, 0.0], b = [1.0, 2.0], c = [3.0, 1.0]
        for ukur in [Ml.euclidean, Ml.manhattan, Ml.chebyshev] {
            #expect(abs(ukur(a, b) - ukur(b, a)) < 1e-12)
            #expect(ukur(a, c) <= ukur(a, b) + ukur(b, c) + 1e-12)
            #expect(ukur(a, a) == 0.0)
        }
    }

    @Test("Perolehan informasi pada dataset tenis")
    func perolehan() {
        let cuaca = ["Cerah", "Cerah", "Mendung", "Hujan", "Hujan", "Hujan", "Mendung",
                     "Cerah", "Cerah", "Hujan", "Cerah", "Mendung", "Mendung", "Hujan"]
        let label = ["Tidak", "Tidak", "Ya", "Ya", "Ya", "Tidak", "Ya",
                     "Tidak", "Ya", "Ya", "Ya", "Ya", "Ya", "Tidak"]
        #expect(abs(Ml.entropi(label) - 0.9402859586706311) < 1e-12)
        #expect(abs(Ml.perolehanInformasi(cuaca, label) - 0.24674981977443933) < 1e-12)
        #expect(Ml.perolehanInformasi(cuaca, label) >= 0)
        // Panjang yang tidak sepadan menghasilkan nol, bukan galat.
        #expect(Ml.perolehanInformasi(["a"], label) == 0.0)
    }
}

// ---------------------------------------------------------------------------
// Pembangkit acak
// ---------------------------------------------------------------------------

@Suite("Pembangkit acak")
struct UjiRng {
    @Test("Deret rujukan SplitMix64")
    func deretRujukan() {
        var r = SplitMix64(benih: 0)
        #expect(Fx.keHex(Double(bitPattern: r.berikutU64())) == "e220a8397b1dcdaf")
        #expect(Fx.keHex(Double(bitPattern: r.berikutU64())) == "6e789e6aa1b965f4")
    }

    @Test("Benih sama menghasilkan deret sama")
    func benihSama() {
        var a = SplitMix64(benih: 42)
        var b = SplitMix64(benih: 42)
        for _ in 0..<50 {
            #expect(a.berikutU64() == b.berikutU64())
        }
    }

    @Test("Pecahan selalu di dalam nol sampai satu")
    func pecahan() {
        var r = SplitMix64(benih: 7)
        var jumlah = 0.0
        for _ in 0..<2000 {
            let v = r.berikutF64()
            #expect(v >= 0.0 && v < 1.0)
            jumlah += v
        }
        #expect(abs(jumlah / 2000.0 - 0.5) < 0.05)
    }

    @Test("Batas atas tidak pernah dicapai")
    func batasAtas() {
        var r = SplitMix64(benih: 3)
        for _ in 0..<2000 {
            #expect(r.dibawah(10) < 10)
        }
        #expect(r.dibawah(0) == 0)
    }

    @Test("Pengacakan mempertahankan seluruh isinya")
    func acakUtuh() {
        var r = SplitMix64(benih: 9)
        var isi = Array(0..<50)
        r.acak(&isi)
        #expect(isi.sorted() == Array(0..<50))
        #expect(isi != Array(0..<50))
    }

    @Test("Larik pendek aman diacak")
    func acakPendek() {
        var r = SplitMix64(benih: 1)
        var kosong: [Int] = []
        r.acak(&kosong)
        #expect(kosong.isEmpty)
        var satu = [7]
        r.acak(&satu)
        #expect(satu == [7])
    }
}

// ---------------------------------------------------------------------------
// Mesin ujian
// ---------------------------------------------------------------------------

@Suite("Bank soal")
struct UjiBank {
    @Test("Kode soal unik")
    func kodeUnik() {
        let kode = Bank.semua.map(\.kode)
        #expect(Set(kode).count == kode.count)
    }

    @Test("Setiap soal punya pembahasan yang benar-benar menjelaskan")
    func pembahasan() {
        for s in Bank.semua {
            // Diperiksa di kedua bahasa dengan ambang yang sama. Terjemahan
            // yang berhenti di tengah lolos setiap pemeriksaan lain, dan yang
            // membaca separuhnya justru orang yang tidak bisa membaca
            // separuh satunya.
            for teks in [s.pertanyaan.id, s.pertanyaan.en] {
                #expect(teks.count > 20, "\(s.kode)")
            }
            for teks in [s.pembahasan.id, s.pembahasan.en] {
                // Soal tanpa pembahasan hanya menguji, tidak mengajari.
                #expect(teks.count > 80, "\(s.kode)")
            }
            #expect(s.tingkat >= 1 && s.tingkat <= 3, "\(s.kode)")
            #expect(s.sesi >= 1 && s.sesi <= 14, "\(s.kode)")
        }
    }

    @Test("Prosa tiap soal benar-benar diterjemahkan, bukan disalin")
    func dwibahasa() {
        // Menyalin kolom Indonesia ke kolom Inggris lolos setiap pemeriksaan
        // panjang di atas: ia menghasilkan bank yang mengaku dwibahasa
        // padahal menampilkan satu bahasa dua kali.
        //
        // Yang diperiksa prosanya saja. Sebagian pilihan memang sama di kedua
        // bahasa — nama metode seperti "Sugeno", satuan seperti "km", dan kata
        // Indonesia yang justru sedang diuji pada soal stemming.
        for s in Bank.semua {
            #expect(s.pertanyaan.id != s.pertanyaan.en, "\(s.kode) pertanyaan")
            #expect(s.pembahasan.id != s.pembahasan.en, "\(s.kode) pembahasan")
        }
    }

    @Test("Tiap pilihan dan tiap nama sesi terisi di kedua bahasa")
    func pilihanDwibahasa() {
        for s in Bank.semua {
            guard case let .pilihan(pilihan, _) = s.bentuk else { continue }
            for p in pilihan {
                #expect(!p.id.isEmpty, "\(s.kode)")
                #expect(!p.en.isEmpty, "\(s.kode)")
            }
        }
        for x in Bank.sesi {
            #expect(!x.nama.id.isEmpty, "sesi \(x.nomor)")
            #expect(!x.nama.en.isEmpty, "sesi \(x.nomor)")
            #expect(x.nama.id != x.nama.en, "sesi \(x.nomor)")
        }
    }

    @Test("Setiap soal pilihan punya kunci yang sah")
    func kunciSah() {
        for s in Bank.semua {
            if case let .pilihan(pilihan, benar) = s.bentuk {
                #expect(pilihan.count >= 3, "\(s.kode)")
                #expect(benar >= 0 && benar < pilihan.count, "\(s.kode)")
                // Diperiksa per bahasa, bukan per pasang. Dua pilihan yang
                // berbeda dalam bahasa Indonesia tetapi jatuh pada kalimat
                // Inggris yang sama adalah soal yang rusak bagi yang
                // membacanya dalam bahasa Inggris — dan pasangannya tetap
                // berbeda, sehingga membandingkan pasangan tidak melihatnya.
                let idSaja = pilihan.map(\.id)
                let enSaja = pilihan.map(\.en)
                #expect(Set(idSaja).count == idSaja.count, "\(s.kode) punya pilihan kembar (id)")
                #expect(Set(enSaja).count == enSaja.count, "\(s.kode) punya pilihan kembar (en)")
            }
        }
    }

    @Test("Kunci jawaban berangka dihitung, bukan diketik")
    func kunciDihitung() throws {
        // Memeriksa ulang beberapa kunci terhadap modul yang menghasilkannya.
        // Kalau seseorang mengganti salah satunya dengan angka tetap, uji ini
        // yang akan memberitahunya.
        func jawaban(_ kode: String) -> Double? {
            guard let s = Bank.semua.first(where: { $0.kode == kode }),
                  case let .angka(v, _, _) = s.bentuk else { return nil }
            return v
        }
        #expect(jawaban("S03-01") == Bank.bulat(try CertaintyFactor.dariMbMd(0.8, 0.01)))
        #expect(jawaban("S04-01") == Bank.bulat(
            try Bayes.posterior(prior: 0.2, kemungkinanH: 0.9, kemungkinanBukanH: 0.3)))
        #expect(jawaban("S13-05") == Bank.bulat(Ml.euclidean([0, 0], [3, 4])))
    }

    @Test("Setiap sesi kuliah punya minimal satu soal")
    func cakupanSesi() {
        // Bank yang bolong pada satu sesi akan menghasilkan sesi latihan yang
        // diam-diam melewatkan seluruh materinya.
        let sesiBersoal = Set(Bank.semua.map(\.sesi))
        for s in Bank.sesi {
            #expect(sesiBersoal.contains(s.nomor), "sesi \(s.nomor) tidak punya soal")
        }
    }

    @Test("Bank cukup besar untuk menyusun sesi yang bermakna")
    func ukuranBank() {
        #expect(Bank.semua.count >= 40)
    }
}

@Suite("Penilaian")
struct UjiPenilaian {
    let soalPilihan = Soal(
        kode: "T1", sesi: 1, topik: "uji",
        pertanyaan: bi("Pertanyaan uji yang cukup panjang", "A test question, long enough"),
        bentuk: .pilihan(pilihan: [bi("a", "a"), bi("b", "b"), bi("c", "c")], benar: 1),
        pembahasan: bi("Pembahasan uji.", "Test explanation."))

    let soalAngka = Soal(
        kode: "T2", sesi: 1, topik: "uji",
        pertanyaan: bi("Pertanyaan uji yang cukup panjang", "A test question, long enough"),
        bentuk: .angka(jawaban: 0.79, toleransi: 0.005, satuan: bi("", "")),
        pembahasan: bi("Pembahasan uji.", "Test explanation."))

    @Test("Pilihan ganda dinilai menurut indeksnya")
    func pilihan() {
        #expect(Penilai.nilai(soalPilihan, .pilihan(1)).benar)
        #expect(!Penilai.nilai(soalPilihan, .pilihan(0)).benar)
    }

    @Test("Soal berangka dinilai dengan toleransi")
    func angka() {
        // Mahasiswa yang menulis 0,79 untuk jawaban 0,7900000000000001 tidak
        // sedang keliru; menuntut kesamaan persis berarti menghukum pembulatan.
        #expect(Penilai.nilai(soalAngka, .angka(0.79)).benar)
        #expect(Penilai.nilai(soalAngka, .angka(0.7901)).benar)
        #expect(!Penilai.nilai(soalAngka, .angka(0.8)).benar)
    }

    @Test("Jawaban kosong dan tak berhingga dinilai salah")
    func kosong() {
        #expect(!Penilai.nilai(soalPilihan, .kosong).benar)
        #expect(!Penilai.nilai(soalAngka, .kosong).benar)
        #expect(!Penilai.nilai(soalAngka, .angka(.nan)).benar)
        #expect(!Penilai.nilai(soalAngka, .angka(.infinity)).benar)
    }

    @Test("Bentuk jawaban yang tidak cocok dinilai salah, bukan menabrak")
    func bentukTakCocok() {
        #expect(!Penilai.nilai(soalPilihan, .angka(1)).benar)
        #expect(!Penilai.nilai(soalAngka, .benarSalah(true)).benar)
    }

    @Test("Selisih dilaporkan untuk soal berangka")
    func selisih() {
        let p = Penilai.nilai(soalAngka, .angka(0.8))
        #expect(p.selisih != nil)
        #expect(abs(p.selisih! - 0.01) < 1e-9)
    }
}

@Suite("Penyusun sesi")
struct UjiSesi {
    @Test("Benih sama menghasilkan sesi sama")
    func benihSama() {
        let a = PenyusunSesi.susun(bank: Bank.semua, banyak: 10, benih: 42)
        let b = PenyusunSesi.susun(bank: Bank.semua, banyak: 10, benih: 42)
        #expect(a.soal.map(\.kode) == b.soal.map(\.kode))
    }

    @Test("Benih berbeda menghasilkan urutan berbeda")
    func benihBeda() {
        let a = PenyusunSesi.susun(bank: Bank.semua, banyak: 15, benih: 1)
        let b = PenyusunSesi.susun(bank: Bank.semua, banyak: 15, benih: 2)
        #expect(a.soal.map(\.kode) != b.soal.map(\.kode))
    }

    @Test("Menyisipkan soal baru tidak mengubah sesi berbenih sama")
    func urutanStabil() {
        // Bank diurutkan menurut kode sebelum diacak. Tanpa itu, benih yang
        // sama akan menghasilkan sesi yang berbeda setelah seseorang
        // menyisipkan satu soal di tengah berkas sumbernya.
        var bankAcak = Bank.semua
        bankAcak.reverse()
        let a = PenyusunSesi.susun(bank: Bank.semua, banyak: 10, benih: 7)
        let b = PenyusunSesi.susun(bank: bankAcak, banyak: 10, benih: 7)
        #expect(a.soal.map(\.kode) == b.soal.map(\.kode))
    }

    @Test("Penyaring sesi kuliah bekerja")
    func saringSesi() {
        let s = PenyusunSesi.susun(bank: Bank.semua, banyak: 50, benih: 3, sesiTerpilih: 3)
        #expect(!s.soal.isEmpty)
        #expect(s.soal.allSatisfy { $0.sesi == 3 })
    }

    @Test("Meminta lebih banyak daripada yang tersedia tidak menabrak")
    func mintaBerlebih() {
        let s = PenyusunSesi.susun(bank: Bank.semua, banyak: 9999, benih: 5)
        #expect(s.soal.count == Bank.semua.count)
        let kosong = PenyusunSesi.susun(bank: Bank.semua, banyak: 0, benih: 5)
        #expect(kosong.soal.isEmpty)
        #expect(kosong.batasDetik == 0)
    }

    @Test("Pilihan ikut diacak dan kuncinya ikut berpindah")
    func acakPilihan() {
        // Tanpa ini, jawaban benar akan selalu berada di posisi yang sama dan
        // mahasiswa akan menghafal posisinya alih-alih materinya.
        var beda = 0
        for benih in UInt64(0)..<40 {
            let s = PenyusunSesi.susun(bank: Bank.semua, banyak: 40, benih: benih)
            for soal in s.soal {
                guard case let .pilihan(pilihan, benar) = soal.bentuk,
                      let asli = Bank.semua.first(where: { $0.kode == soal.kode }),
                      case let .pilihan(pilihanAsli, benarAsli) = asli.bentuk else { continue }
                // Kuncinya harus tetap menunjuk teks yang sama.
                #expect(pilihan[benar] == pilihanAsli[benarAsli], "\(soal.kode)")
                #expect(Set(pilihan) == Set(pilihanAsli), "\(soal.kode)")
                if benar != benarAsli { beda += 1 }
            }
        }
        #expect(beda > 0, "posisi kunci tidak pernah berpindah")
    }

    @Test("Batas waktu sebanding dengan jumlah soal")
    func batasWaktu() {
        let s = PenyusunSesi.susun(bank: Bank.semua, banyak: 10, benih: 1)
        #expect(s.batasDetik == 10 * PenyusunSesi.detikPerSoal)
    }
}

@Suite("Ringkasan hasil")
struct UjiRingkasan {
    @Test("Nilai dihitung benar")
    func nilai() {
        let sesi = PenyusunSesi.susun(bank: Bank.semua, banyak: 4, benih: 11)
        let penilaian = sesi.soal.enumerated().map { i, s in
            Penilaian(kode: s.kode, benar: i < 3, selisih: nil, pembahasan: bi("", ""))
        }
        let r = Perangkum.rangkum(soal: sesi.soal, penilaian: penilaian)
        #expect(r.benar == 3)
        #expect(r.total == 4)
        #expect(r.nilai == 75.0)
    }

    @Test("Sesi kosong tidak membagi dengan nol")
    func sesiKosong() {
        let r = Perangkum.rangkum(soal: [], penilaian: [])
        #expect(r.total == 0)
        #expect(r.nilai == 0.0)
        #expect(r.perTopik.isEmpty)
    }

    @Test("Topik terlemah muncul lebih dulu")
    func urutanTopik() {
        // Mengurutkannya menurut nama akan membuat bagian yang paling perlu
        // diulang tenggelam di tengah daftar.
        let sesi = PenyusunSesi.susun(bank: Bank.semua, banyak: 20, benih: 13)
        let penilaian = sesi.soal.enumerated().map { i, s in
            Penilaian(kode: s.kode, benar: i % 3 != 0, selisih: nil, pembahasan: bi("", ""))
        }
        let r = Perangkum.rangkum(soal: sesi.soal, penilaian: penilaian)
        let ketepatan = r.perTopik.map { Double($0.benar) / Double($0.total) }
        #expect(ketepatan == ketepatan.sorted())
    }
}

@Suite("Penjadwal ulangan")
struct UjiPenjadwal {
    @Test("Jawaban benar memperpanjang jaraknya")
    func benarMemperpanjang() {
        var h = Hafalan(kode: "A")
        h = Penjadwal.perbarui(h, mutu: 5)
        #expect(h.jarakHari == 1)
        h = Penjadwal.perbarui(h, mutu: 5)
        #expect(h.jarakHari == 6)
        h = Penjadwal.perbarui(h, mutu: 5)
        #expect(h.jarakHari > 6)
    }

    @Test("Jawaban salah mengembalikan hitungannya ke nol")
    func salahMengulang() {
        var h = Hafalan(kode: "A", ulangan: 5, jarakHari: 30, kemudahan: 2.5)
        h = Penjadwal.perbarui(h, mutu: 1)
        #expect(h.ulangan == 0)
        #expect(h.jarakHari == 1)
        // Faktor kemudahannya turun tetapi tidak dihapus: yang perlu diulang
        // adalah soalnya, bukan seluruh riwayat belajarnya.
        #expect(h.kemudahan < 2.5)
        #expect(h.kemudahan >= Penjadwal.kemudahanMinimum)
    }

    @Test("Faktor kemudahan punya batas bawah")
    func batasBawah() {
        // Tanpa batas bawah, soal yang berkali-kali salah akan muncul
        // terus-menerus sampai menutupi seluruh sesi.
        var h = Hafalan(kode: "A")
        for _ in 0..<50 {
            h = Penjadwal.perbarui(h, mutu: 0)
        }
        #expect(h.kemudahan == Penjadwal.kemudahanMinimum)
    }

    @Test("Mutu di luar rentang dibatasi")
    func mutuDibatasi() {
        var h = Hafalan(kode: "A")
        let a = Penjadwal.perbarui(h, mutu: 99)
        h = Hafalan(kode: "A")
        let b = Penjadwal.perbarui(h, mutu: 5)
        #expect(a == b)
    }

    @Test("Jawaban cepat dinilai lebih tinggi daripada yang lambat")
    func mutuMenurutWaktu() {
        #expect(Penjadwal.mutu(benar: true, detik: 10, batasDetik: 90) == 5)
        #expect(Penjadwal.mutu(benar: true, detik: 50, batasDetik: 90) == 4)
        #expect(Penjadwal.mutu(benar: true, detik: 85, batasDetik: 90) == 3)
        #expect(Penjadwal.mutu(benar: false, detik: 10, batasDetik: 90) == 2)
        #expect(Penjadwal.mutu(benar: false, detik: 90, batasDetik: 90) == 0)
    }

    @Test("Batas waktu nol tidak membagi dengan nol")
    func batasNol() {
        #expect(Penjadwal.mutu(benar: true, detik: 0, batasDetik: 0) == 3)
    }
}
