<!--
  Sesi ujian bertimer.

  # Kenapa pewaktunya per sesi, bukan per soal

  Pewaktu per soal memaksa ritme yang seragam, padahal soal berhitung memang
  butuh lebih lama daripada soal ingatan. Pewaktu per sesi membiarkan peserta
  membagi waktunya sendiri — dan pembagian waktu itu sendiri bagian dari yang
  diuji ujian sungguhan.

  # Kenapa pembahasannya muncul segera setelah dijawab

  Bukan di akhir sesi. Jarak antara menjawab dan mengetahui benar-salahnya
  menentukan seberapa banyak yang melekat; menundanya sampai akhir mengubah
  latihan menjadi sekadar pengukuran.

  .Deckyx
-->
<script lang="ts">
  import { bacaAngka, jam, nilai, susunSesi } from "../bank";
  import { T, pilih } from "../i18n.svelte";
  import type { Jawaban, Penilaian, Soal } from "../bank";

  interface Props {
    banyak: number;
    benih: bigint;
    sesiTerpilih?: number | undefined;
    onSelesai: (soal: Soal[], penilaian: Penilaian[], terpakaiDetik: number) => void;
  }

  const { banyak, benih, sesiTerpilih, onSelesai }: Props = $props();

  const sesi = $derived(susunSesi(banyak, benih, sesiTerpilih));

  let indeks = $state(0);
  let penilaian = $state<Penilaian[]>([]);
  let jawabanSekarang = $state<Jawaban>({ jenis: "kosong" });
  let teksAngka = $state("");
  let sudahDinilai = $state(false);
  let tersisa = $state(0);
  let mulai = $state(Date.now());

  const soal = $derived(sesi.soal[indeks]);
  const kritis = $derived(tersisa <= 30);
  const bagianWaktu = $derived(
    sesi.batasDetik > 0 ? Math.max(0, tersisa) / sesi.batasDetik : 0,
  );

  $effect(() => {
    // Pewaktunya disetel ulang tiap kali sesinya berganti, bukan hanya saat
    // dipasang. Tanpa ini, mengganti jumlah soal di tengah jalan meninggalkan
    // pewaktu lama yang batasnya tidak lagi cocok.
    tersisa = sesi.batasDetik;
    mulai = Date.now();
    indeks = 0;
    penilaian = [];
    jawabanSekarang = { jenis: "kosong" };
    teksAngka = "";
    sudahDinilai = false;
  });

  $effect(() => {
    if (sesi.batasDetik === 0) return;
    const jamId = setInterval(() => {
      tersisa -= 1;
      if (tersisa <= 0) {
        clearInterval(jamId);
        // Waktu habis: soal yang belum dijawab dinilai kosong, bukan
        // dilewatkan. Soal yang tidak dijawab tetap soal yang tidak dikuasai.
        habiskan();
      }
    }, 1000);
    return () => clearInterval(jamId);
  });

  function habiskan() {
    const sisa = sesi.soal.slice(penilaian.length).map((s) => nilai(s, { jenis: "kosong" }));
    const semua = [...penilaian, ...sisa];
    onSelesai(sesi.soal, semua, sesi.batasDetik);
  }

  function jawab() {
    if (!soal || sudahDinilai) return;
    let j = jawabanSekarang;
    if (soal.bentuk === "angka") {
      j = { jenis: "angka", nilai: bacaAngka(teksAngka) };
    }
    penilaian = [...penilaian, nilai(soal, j)];
    jawabanSekarang = j;
    sudahDinilai = true;
  }

  function lanjut() {
    if (indeks + 1 >= sesi.soal.length) {
      onSelesai(sesi.soal, penilaian, Math.round((Date.now() - mulai) / 1000));
      return;
    }
    indeks += 1;
    jawabanSekarang = { jenis: "kosong" };
    teksAngka = "";
    sudahDinilai = false;
  }

  const hasilSekarang = $derived(sudahDinilai ? penilaian[penilaian.length - 1] : undefined);

  /** Apakah sebuah pilihan sudah dipilih peserta. */
  function terpilih(i: number): boolean {
    return jawabanSekarang.jenis === "pilihan" && jawabanSekarang.nilai === i;
  }

  /** Kelas tambahan sebuah pilihan setelah dinilai. */
  function kelasPilihan(i: number): string {
    if (!sudahDinilai || !soal || soal.bentuk !== "pilihan") return "";
    if (i === soal.benar) return " pilihan__butir--benar";
    if (terpilih(i)) return " pilihan__butir--salah";
    return "";
  }

  const HURUF = ["A", "B", "C", "D", "E", "F"];
</script>

<div class="kartu">
  <div class="pewaktu">
    <span
      class="pewaktu__angka{kritis ? ' pewaktu__angka--kritis' : ''}"
      aria-live="off"
      aria-label="Sisa waktu {jam(tersisa)}">{jam(tersisa)}</span
    >
    <div
      class="pewaktu__bilah"
      role="progressbar"
      aria-label="Sisa waktu"
      aria-valuenow={Math.max(0, tersisa)}
      aria-valuemin="0"
      aria-valuemax={sesi.batasDetik}
    >
      <span class={kritis ? "kritis" : ""} style="width: {bagianWaktu * 100}%"></span>
    </div>
    <span class="langkah-nomor"
      >{pilih(T.soalKeDari)
        .replace("%I", String(indeks + 1))
        .replace("%T", String(sesi.soal.length))}</span
    >
  </div>
</div>

{#if soal}
  <div class="kartu">
    <div class="langkah-nomor">
      Sesi {String(soal.sesi).padStart(2, "0")} · {soal.topik} · tingkat {soal.tingkat}
    </div>
    <p class="soal">{soal.pertanyaan}</p>

    {#if soal.bentuk === "pilihan"}
      <div class="pilihan" role="group" aria-label="Pilihan jawaban">
        {#each soal.pilihan as pilihan, i (pilihan)}
          <button
            type="button"
            class="tombol pilihan__butir{kelasPilihan(i)}"
            aria-pressed={terpilih(i)}
            disabled={sudahDinilai}
            onclick={() => (jawabanSekarang = { jenis: "pilihan", nilai: i })}
          >
            <span class="pilihan__huruf">{HURUF[i]}</span>
            <span>{pilihan}</span>
          </button>
        {/each}
      </div>
    {:else if soal.bentuk === "benarSalah"}
      <div class="baris" role="group" aria-label="Pilihan jawaban">
        {#each [true, false] as v (v)}
          <button
            type="button"
            class="tombol"
            aria-pressed={jawabanSekarang.jenis === "benarSalah" && jawabanSekarang.nilai === v}
            disabled={sudahDinilai}
            onclick={() => (jawabanSekarang = { jenis: "benarSalah", nilai: v })}
          >
            {v ? "Benar" : "Salah"}
          </button>
        {/each}
      </div>
    {:else}
      <label class="bidang">
        <span class="bidang__label">
          Jawaban berupa angka{soal.satuan ? ` (${soal.satuan})` : ""} — koma
          maupun titik sama-sama diterima
        </span>
        <input
          type="text"
          inputmode="decimal"
          bind:value={teksAngka}
          disabled={sudahDinilai}
          placeholder="mis. 0,79"
          onkeydown={(e) => {
            if (e.key === "Enter" && !sudahDinilai) jawab();
          }}
        />
      </label>
    {/if}

    {#if sudahDinilai && hasilSekarang}
      <div class="pembahasan">
        <span class="lencana lencana--{hasilSekarang.benar ? 'benar' : 'salah'}">
          {hasilSekarang.benar ? "Benar" : "Salah"}
        </span>
        {#if soal.bentuk === "angka" && !hasilSekarang.benar}
          <span class="catatan">
            &nbsp;{pilih(T.jawabanDiterima)
              .replace("%J", String(soal.jawaban))
              .replace("%E", String(soal.toleransi))}
          </span>
        {/if}
        <p style="margin: 0.5rem 0 0">{soal.pembahasan}</p>
      </div>
    {/if}

    <div class="baris">
      {#if !sudahDinilai}
        <button
          type="button"
          class="tombol tombol--utama"
          disabled={soal.bentuk === "angka"
            ? teksAngka.trim().length === 0
            : jawabanSekarang.jenis === "kosong"}
          onclick={jawab}>Kunci jawaban</button
        >
        <button
          type="button"
          class="tombol"
          onclick={() => {
            jawabanSekarang = { jenis: "kosong" };
            jawab();
          }}>Lewati</button
        >
      {:else}
        <button type="button" class="tombol tombol--utama" onclick={lanjut}>
          {indeks + 1 >= sesi.soal.length ? "Lihat hasil" : "Soal berikutnya"}
        </button>
      {/if}
    </div>
  </div>
{/if}
