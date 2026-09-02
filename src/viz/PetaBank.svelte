<!--
  Peta cakupan bank soal: 14 sesi × tingkat kesulitan.

  # Kenapa gambar ini ada

  Halaman beranda sudah menampilkan jumlah soal per sesi sebagai angka. Angka
  itu menjawab "berapa banyak" dan tidak menjawab "apa". Bank yang berisi lima
  soal mudah dan bank yang berisi lima soal sukar terlihat sama persis di
  daftar angka, padahal keduanya menyiapkan mahasiswa untuk ujian yang berbeda.

  Peta ini menjawab pertanyaan yang tidak ditanyakan siapa pun sampai ia
  terlihat: **di mana lubangnya.** Sesi yang tidak punya satu pun soal sukar
  langsung terlihat sebagai baris yang kosong di kolom kanan.

  .Deckyx
-->
<script lang="ts">
  import Gambar from "./Gambar.svelte";
  import { T as KAMUS, pilih } from "../i18n.svelte";
  import { potong } from "./dasar";
  import { BANK, SESI } from "../bank";

  const TINGKAT = [
    { nilai: 1, nama: "ingatan" },
    { nilai: 2, nama: "pemahaman" },
    { nilai: 3, nama: "penerapan" },
  ];

  const L = 640;
  const KIRI = 150;
  const ATAS = 34;
  const TINGGI_BARIS = 22;
  const T = ATAS + SESI.length * TINGGI_BARIS + 30;
  const LEBAR_KOLOM = (L - KIRI - 16) / TINGKAT.length;

  interface Petak {
    sesi: number;
    tingkat: number;
    jumlah: number;
  }

  const petak: Petak[] = SESI.flatMap((s) =>
    TINGKAT.map((t) => ({
      sesi: s.nomor,
      tingkat: t.nilai,
      jumlah: BANK.filter((x) => x.sesi === s.nomor && x.tingkat === t.nilai).length,
    })),
  );

  const terbanyak = Math.max(...petak.map((p) => p.jumlah), 1);
  const kosong = petak.filter((p) => p.jumlah === 0).length;

  /**
   * Buram sebanding dengan jumlah, dengan dasar yang tidak nol untuk petak
   * yang terisi. Tanpa dasar itu, petak berisi satu soal pada bank yang
   * terbanyaknya lima akan tergambar 20% — nyaris tak terbedakan dari petak
   * yang benar-benar kosong, padahal keduanya berarti hal yang sangat berbeda.
   */
  function buram(jumlah: number): number {
    if (jumlah === 0) return 0;
    return 0.28 + 0.62 * (jumlah / terbanyak);
  }

  // $derived: keterangannya ikut berganti saat bahasanya berganti. Sebagai
  // tetapan biasa ia akan membeku pada bahasa yang aktif waktu komponennya
  // pertama digambar.
  const terang = $derived(
    pilih(KAMUS.petaTerang)
      .replace("%K", String(SESI.length * TINGKAT.length))
      .replace("%O", String(kosong)),
  );
</script>

<Gambar judul={pilih(KAMUS.petaJudul)} {terang} lebar={L} tinggi={T}>
  {#each TINGKAT as t, i (t.nilai)}
    <text
      x={KIRI + i * LEBAR_KOLOM + LEBAR_KOLOM / 2}
      y={ATAS - 12}
      text-anchor="middle"
      font-size="10"
      fill="var(--teks-3)">{t.nama}</text
    >
  {/each}

  {#each SESI as s, baris (s.nomor)}
    <text
      x={KIRI - 10}
      y={ATAS + baris * TINGGI_BARIS + 15}
      text-anchor="end"
      font-size="10"
      fill="var(--teks-2)"
    >
      {String(s.nomor).padStart(2, "0")} · {potong(pilih(s.nama), 22)}
    </text>

    {#each TINGKAT as t, kolom (t.nilai)}
      {@const p = petak.find((x) => x.sesi === s.nomor && x.tingkat === t.nilai)!}
      <rect
        x={KIRI + kolom * LEBAR_KOLOM + 2}
        y={ATAS + baris * TINGGI_BARIS + 2}
        width={LEBAR_KOLOM - 4}
        height={TINGGI_BARIS - 4}
        rx="3"
        fill={p.jumlah === 0 ? "var(--latar-2)" : "var(--aksen)"}
        fill-opacity={p.jumlah === 0 ? 1 : buram(p.jumlah)}
        stroke="var(--garis)"
        stroke-width="1"
      />
      {#if p.jumlah > 0}
        <!-- Angkanya dituliskan, tidak hanya diwarnai. Mata tidak bisa
             membaca "tiga" dari kepekatan; warna menunjukkan polanya, angka
             menjawab pertanyaannya. -->
        <text
          x={KIRI + kolom * LEBAR_KOLOM + LEBAR_KOLOM / 2}
          y={ATAS + baris * TINGGI_BARIS + 15}
          text-anchor="middle"
          font-size="10"
          font-weight="600"
          fill="var(--latar)">{p.jumlah}</text
        >
      {/if}
    {/each}
  {/each}
</Gambar>
