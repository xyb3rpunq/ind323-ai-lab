<!--
  Kurva penjadwalan SM-2: kapan sebuah soal kembali muncul.

  # Kenapa gambar ini ada

  Karena penjadwal SM-2 adalah mesin situs ini, dan sampai sekarang ia sama
  sekali tidak terlihat. Ia ada di `Sources/AIKit/Ujian.swift`, bekerja dengan
  benar, dan tidak seorang pun pengunjung pernah tahu ia ada.

  Yang dijawab gambar ini satu pertanyaan yang tidak bisa dijawab tabel:
  *seberapa jauh jaraknya melebar, dan berapa yang hilang karena satu jawaban
  salah.* Keduanya besaran yang tumbuh berlipat, dan besaran yang tumbuh
  berlipat memang paling jelas dilihat sebagai bentuk.

  # Kenapa sumbunya logaritmik

  Karena jarak ulangan bergerak dari satu hari ke belasan ribu hari. Pada
  sumbu linear, sembilan ulangan pertama menjadi satu garis rata di dasar
  grafik dan yang tersisa hanyalah lonjakan terakhir — kesimpulan yang justru
  terbalik dari yang sebenarnya terjadi.

  .Deckyx
-->
<script lang="ts">
  import Gambar from "./Gambar.svelte";
  import { T as KAMUS, pilih } from "../i18n.svelte";
  import { jejak, type TitikJadwal } from "../jadwal";
  import { lamanya, ribuan, skala, tandaLog } from "./dasar";

  interface Props {
    /** Berapa kali soalnya dijawab. */
    banyakUlangan?: number;
    /** Ulangan ke berapa yang dijawab salah; nol berarti tidak ada. */
    salahDiUlangan?: number;
  }

  const { banyakUlangan = 10, salahDiUlangan = 5 }: Props = $props();

  const L = 640;
  const T = 260;
  const KIRI = 58;
  const KANAN = 16;
  const ATAS = 18;
  const BAWAH = 42;

  /** Deret mutu sempurna, sebagai pembanding. */
  const mulus = $derived(jejak(Array.from({ length: banyakUlangan }, () => 5), "mulus"));

  /** Deret yang sama, dengan satu jawaban salah di tengahnya. */
  const tersandung = $derived(
    jejak(
      Array.from({ length: banyakUlangan }, (_, i) =>
        salahDiUlangan > 0 && i + 1 === salahDiUlangan ? 1 : 5,
      ),
      "tersandung",
    ),
  );

  const semua = $derived([...mulus, ...tersandung]);
  const jarakMaks = $derived(Math.max(...semua.map((t) => t.jarakHari), 10));

  const sx = $derived(skala(1, banyakUlangan, KIRI, L - KANAN));
  const sy = $derived(skala(1, jarakMaks, T - BAWAH, ATAS, true));

  function jalur(titik: TitikJadwal[]): string {
    return titik
      .map((t, i) => `${i === 0 ? "M" : "L"} ${sx(t.ulanganKe).toFixed(1)} ${sy(t.jarakHari).toFixed(1)}`)
      .join(" ");
  }

  const tandaY = $derived(tandaLog(1, jarakMaks));
  const akhirMulus = $derived(mulus[mulus.length - 1]);
  const akhirTersandung = $derived(tersandung[tersandung.length - 1]);

  const terang = $derived(
    (salahDiUlangan > 0 ? pilih(KAMUS.kurvaTerangSalah) : pilih(KAMUS.kurvaTerang))
      .replace("%U", String(banyakUlangan))
      .replace("%M", lamanya(akhirMulus?.jarakHari ?? 0))
      .replace("%S", String(salahDiUlangan))
      .replace("%T", lamanya(akhirTersandung?.jarakHari ?? 0)),
  );

  const kunci = $derived(
    salahDiUlangan > 0
      ? [
          { warna: "var(--benar)", label: pilih(KAMUS.kurvaSelaluBenar) },
          {
            warna: "var(--salah)",
            label: pilih(KAMUS.kurvaSalahDi).replace("%S", String(salahDiUlangan)),
            putus: true,
          },
        ]
      : [{ warna: "var(--benar)", label: pilih(KAMUS.kurvaSelaluBenar) }],
  );
</script>

<Gambar
  judul={pilih(KAMUS.kurvaJudul)}
  {terang}
  lebar={L}
  tinggi={T}
  {kunci}
>
  <!-- Garis bantu dan angkanya. Sumbu tanpa angka sama saja dengan tidak ada. -->
  {#each tandaY as v (v)}
    <line
      x1={KIRI}
      y1={sy(v)}
      x2={L - KANAN}
      y2={sy(v)}
      stroke="var(--garis)"
      stroke-width="1"
    />
    <text
      x={KIRI - 8}
      y={sy(v) + 4}
      text-anchor="end"
      font-size="10"
      fill="var(--teks-3)">{ribuan(v)}</text
    >
  {/each}

  <text
    x={14}
    y={ATAS + 6}
    font-size="10"
    fill="var(--teks-3)"
    transform="rotate(-90 14 {ATAS + 6})">{pilih(KAMUS.sumbuHari)}</text
  >

  {#each mulus as t (t.ulanganKe)}
    {#if t.ulanganKe % 2 === 1 || banyakUlangan <= 12}
      <text
        x={sx(t.ulanganKe)}
        y={T - BAWAH + 16}
        text-anchor="middle"
        font-size="10"
        fill="var(--teks-3)">{t.ulanganKe}</text
      >
    {/if}
  {/each}
  <text
    x={(KIRI + L - KANAN) / 2}
    y={T - 10}
    text-anchor="middle"
    font-size="10"
    fill="var(--teks-3)">{pilih(KAMUS.sumbuUlangan)}</text
  >

  {#if salahDiUlangan > 0}
    <!-- Ditandai di tempatnya, bukan hanya disebut di keterangan: pembaca
         tidak seharusnya perlu menghitung sendiri di sumbu mana kejadiannya. -->
    <line
      x1={sx(salahDiUlangan)}
      y1={ATAS}
      x2={sx(salahDiUlangan)}
      y2={T - BAWAH}
      stroke="var(--salah)"
      stroke-width="1"
      stroke-dasharray="3 3"
      opacity="0.6"
    />
    <path d={jalur(tersandung)} fill="none" stroke="var(--salah)" stroke-width="2" stroke-dasharray="6 4" />
  {/if}

  <path d={jalur(mulus)} fill="none" stroke="var(--benar)" stroke-width="2" />

  {#each mulus as t (t.ulanganKe)}
    <circle cx={sx(t.ulanganKe)} cy={sy(t.jarakHari)} r="3" fill="var(--benar)" />
  {/each}
  {#if salahDiUlangan > 0}
    {#each tersandung as t (t.ulanganKe)}
      <circle cx={sx(t.ulanganKe)} cy={sy(t.jarakHari)} r="3" fill="var(--salah)" />
    {/each}
  {/if}
</Gambar>
