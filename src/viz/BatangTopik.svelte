<!--
  Ketepatan per topik, sebagai gambar dan bukan sebagai deretan bilah CSS.

  # Apa yang berubah dari bentuk sebelumnya

  Bentuk sebelumnya menggambar satu `<div>` per topik dengan lebar sebanding
  ketepatannya. Ia benar dan tidak salah — tetapi ia tidak menjawab dua
  pertanyaan yang justru paling ditanyakan setelah sebuah sesi:

  1. **Berapa yang dijawab, bukan hanya berapa bagiannya.** Topik dengan satu
     soal benar dari satu terlihat sempurna, dan topik dengan delapan dari
     sepuluh terlihat lebih buruk — padahal yang kedua jauh lebih meyakinkan.
     Bilah tanpa jumlah menyembunyikan perbedaan itu sepenuhnya.
  2. **Di mana batas "sudah cukup".** Sebuah garis di 80% mengubah bilah dari
     angka menjadi keputusan: yang di kirinya perlu diulang.

  .Deckyx
-->
<script lang="ts">
  import Gambar from "./Gambar.svelte";
  import { T as KAMUS, pilih } from "../i18n.svelte";
  import { namaTopik } from "../bank";
  import type { RingkasanTopik } from "../bank";
  import { potong, warnaKetepatan } from "./dasar";

  interface Props {
    perTopik: RingkasanTopik[];
    /** Ambang yang dianggap sudah dikuasai. */
    ambang?: number;
  }

  const { perTopik, ambang = 0.8 }: Props = $props();

  const L = 640;
  const KIRI = 168;
  const KANAN = 54;
  const ATAS = 26;
  const TINGGI_BARIS = 26;
  const T = $derived(ATAS + perTopik.length * TINGGI_BARIS + 26);
  const LEBAR = L - KIRI - KANAN;

  const belum = $derived(perTopik.filter((t) => t.benar / t.total < ambang).length);

  const terang = $derived(
    pilih(KAMUS.batangTerang)
      .replace("%A", String(Math.round(ambang * 100)))
      .replace("%B", String(belum))
      .replace("%C", String(perTopik.length)),
  );
</script>

<Gambar
  judul={pilih(KAMUS.batangJudul)}
  {terang}
  lebar={L}
  tinggi={T}
  kunci={[
    { warna: "var(--benar)", label: "80% ke atas" },
    { warna: "var(--aksen)", label: "50–79%" },
    { warna: "var(--salah)", label: "di bawah 50%" },
  ]}
>
  {#each [0, 0.25, 0.5, 0.75, 1] as p (p)}
    <line
      x1={KIRI + p * LEBAR}
      y1={ATAS - 6}
      x2={KIRI + p * LEBAR}
      y2={T - 22}
      stroke="var(--garis)"
      stroke-width="1"
    />
    <text
      x={KIRI + p * LEBAR}
      y={T - 8}
      text-anchor="middle"
      font-size="9"
      fill="var(--teks-3)">{Math.round(p * 100)}%</text
    >
  {/each}

  <line
    x1={KIRI + ambang * LEBAR}
    y1={ATAS - 10}
    x2={KIRI + ambang * LEBAR}
    y2={T - 22}
    stroke="var(--benar)"
    stroke-width="1.5"
    stroke-dasharray="4 3"
  />

  {#each perTopik as t, i (t.topik)}
    {@const bagian = t.benar / t.total}
    {@const y = ATAS + i * TINGGI_BARIS}
    <text x={KIRI - 10} y={y + 14} text-anchor="end" font-size="11" fill="var(--teks-2)">
      {potong(pilih(namaTopik(t.topik)), 26)}
    </text>
    <rect x={KIRI} y={y + 4} width={LEBAR} height="14" rx="3" fill="var(--latar-2)" />
    <rect
      x={KIRI}
      y={y + 4}
      width={Math.max(bagian * LEBAR, bagian > 0 ? 3 : 0)}
      height="14"
      rx="3"
      fill={warnaKetepatan(bagian)}
    />
    <text
      x={KIRI + LEBAR + 8}
      y={y + 15}
      font-size="11"
      font-family="var(--mono)"
      fill="var(--teks-2)">{t.benar}/{t.total}</text
    >
  {/each}
</Gambar>
