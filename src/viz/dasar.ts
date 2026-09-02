/**
 * Bantuan bersama untuk seluruh gambar.
 *
 * # Kenapa SVG dan bukan kanvas
 *
 * Karena yang digambar di situs ini punya makna satuan — sebuah sesi, sebuah
 * topik, sebuah titik ulangan — dan tiap bagian yang bermakna layak bisa
 * diberi nama, ditata lewat CSS, dan dibacakan pembaca layar. Kanvas menyimpan
 * piksel: ia tidak terlihat pembaca layar, tidak ikut berubah saat tema
 * berpindah terang-gelap, dan harus mengurus `devicePixelRatio` sendiri.
 *
 * Kanvas baru menang kalau yang digambar memang ratusan piksel yang hanya
 * berarti secara keseluruhan. Tidak ada yang seperti itu di sini.
 *
 * # Kenapa warnanya token CSS dan bukan nilai heksadesimal
 *
 * Situs ini punya mode terang dan gelap. Warna yang dituliskan langsung akan
 * benar di salah satunya dan salah di yang lain, dan yang salah adalah yang
 * tidak pernah dilihat penulisnya.
 *
 * .Deckyx
 */

/** Angka untuk ditampilkan; dibulatkan pada tampilan saja. */
export function n(x: number, digit = 2): string {
  if (!Number.isFinite(x)) return "—";
  const s = x.toFixed(digit);
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/** Angka besar dengan pemisah ribuan, untuk sumbu hari. */
export function ribuan(x: number): string {
  return Math.round(x).toLocaleString("id-ID");
}

/** Jarak hari sebagai satuan yang bisa dibaca manusia. */
export function lamanya(hari: number): string {
  if (hari < 1) return "hari yang sama";
  if (hari === 1) return "1 hari";
  if (hari < 30) return `${Math.round(hari)} hari`;
  if (hari < 365) return `${n(hari / 30, 1)} bulan`;
  return `${n(hari / 365, 1)} tahun`;
}

/** Membatasi sebuah nilai ke rentang tertutup. */
export function batas(x: number, lo: number, hi: number): number {
  return Math.min(Math.max(x, lo), hi);
}

/**
 * Skala yang memetakan rentang nilai ke rentang piksel.
 *
 * `logaritmik` disediakan karena sebagian besaran di situs ini tumbuh
 * berlipat: jarak ulangan SM-2 bergerak dari satu hari ke belasan ribu hari.
 * Sumbu linear untuk besaran seperti itu memampatkan sembilan ulangan pertama
 * menjadi satu garis rata di dasar grafik, dan yang tersisa hanyalah lonjakan
 * terakhir — kesimpulan yang justru terbalik dari yang sebenarnya terjadi.
 */
export interface Skala {
  (nilai: number): number;
  readonly minimum: number;
  readonly maksimum: number;
}

export function skala(
  minimum: number,
  maksimum: number,
  piksel0: number,
  piksel1: number,
  logaritmik = false,
): Skala {
  const aman = (v: number) => (logaritmik ? Math.log10(Math.max(v, 1e-9)) : v);
  const a = aman(minimum);
  const b = aman(maksimum);
  const rentang = b - a || 1;
  const f = ((nilai: number) =>
    piksel0 + ((aman(nilai) - a) / rentang) * (piksel1 - piksel0)) as {
    (nilai: number): number;
    minimum: number;
    maksimum: number;
  };
  f.minimum = minimum;
  f.maksimum = maksimum;
  return f as Skala;
}

/**
 * Nilai-nilai bulat yang enak dibaca di sepanjang sebuah sumbu.
 *
 * Dipilih dari 1-2-5 × pangkat sepuluh. Membagi rentangnya menjadi lima
 * bagian sama besar menghasilkan angka seperti 2.573 yang benar tetapi tidak
 * bisa dibaca sekilas, dan sumbu yang tidak bisa dibaca sekilas sama saja
 * dengan sumbu tanpa angka.
 */
export function tandaSumbu(minimum: number, maksimum: number, sekitar = 5): number[] {
  if (!(maksimum > minimum)) return [minimum];
  const kasar = (maksimum - minimum) / sekitar;
  const pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
  const sisa = kasar / pangkat;
  const langkah = (sisa >= 5 ? 10 : sisa >= 2 ? 5 : sisa >= 1 ? 2 : 1) * pangkat;
  const keluar: number[] = [];
  for (let v = Math.ceil(minimum / langkah) * langkah; v <= maksimum; v += langkah) {
    keluar.push(Number(v.toPrecision(12)));
  }
  return keluar;
}

/** Tanda sumbu untuk skala logaritmik: satu per pangkat sepuluh. */
export function tandaLog(minimum: number, maksimum: number): number[] {
  const keluar: number[] = [];
  const awal = Math.floor(Math.log10(Math.max(minimum, 1e-9)));
  const akhir = Math.ceil(Math.log10(Math.max(maksimum, 1e-9)));
  for (let p = awal; p <= akhir; p += 1) {
    const v = Math.pow(10, p);
    if (v >= minimum * 0.999 && v <= maksimum * 1.001) keluar.push(v);
  }
  return keluar;
}

/**
 * Warna untuk bagian benar dari nol sampai satu.
 *
 * Tiga tingkat, bukan gradasi mulus. Gradasi mulus terlihat lebih halus dan
 * menyampaikan lebih sedikit: mata tidak bisa membedakan 62% dari 68% lewat
 * warna, sementara tiga tingkat yang jelas langsung menjawab pertanyaan yang
 * sebenarnya ditanyakan — sudah dikuasai, setengah, atau belum.
 */
export function warnaKetepatan(bagian: number): string {
  if (bagian >= 0.8) return "var(--benar)";
  if (bagian >= 0.5) return "var(--aksen)";
  return "var(--salah)";
}
