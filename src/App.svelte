<!--
  Kerangka aplikasi.

  Perutean memakai tanda pagar karena situsnya terbit di GitHub Pages, yang
  tidak bisa disetel mengarahkan seluruh jalur ke satu berkas.

  .Deckyx
-->
<script lang="ts">
  import Ujian from "./lib/Ujian.svelte";
  import { BANK, SESI, jam, namaTopik, rangkum } from "./bank";
  import { muatPembahasan, pembahasanDari } from "./pembahasan";
  import type { Penilaian, Ringkasan, Soal } from "./bank";
  import { MATERI } from "./materi";
  import BatangTopik from "./viz/BatangTopik.svelte";
  import KurvaJadwal from "./viz/KurvaJadwal.svelte";
  import PetaBank from "./viz/PetaBank.svelte";
  import Presentasi from "./lib/Presentasi.svelte";
  import { T, aturBahasa, bahasa, bi, pilih, pulihkanBahasa } from "./i18n.svelte";
  import { unduhRapor } from "./ekspor";

  type Layar = "beranda" | "ujian" | "hasil" | "materi" | "presentasi";

  let layar = $state<Layar>("beranda");
  let banyak = $state(10);
  let benihTeks = $state("2026");
  let sesiTerpilih = $state<number | undefined>(undefined);

  let hasilSoal = $state<Soal[]>([]);
  let hasilPenilaian = $state<Penilaian[]>([]);
  let terpakai = $state(0);
  let sesiMateri = $state<number>(1);

  // Bahasa dipulihkan sebelum apa pun tergambar. Menyetelnya setelah render
  // pertama membuat halaman berkedip dari satu bahasa ke bahasa lain, dan
  // kedipan itu paling terlihat justru bagi pembaca yang memang memilih
  // bahasa kedua.
  pulihkanBahasa();

  // Kendali gambar penjadwalan. Dibiarkan bisa digeser karena pertanyaan
  // "berapa harga satu kesalahan" jawabannya berbeda-beda tergantung kapan
  // kesalahannya terjadi — dan itu jauh lebih meyakinkan kalau bisa dicoba
  // sendiri daripada kalau hanya dibaca.
  let kabarEkspor = $state<{ teks: string; benar: boolean } | null>(null);

  function padaUnduhRapor() {
    try {
      const nama = unduhRapor(
        {
          ringkasan,
          soal: hasilSoal,
          penilaian: hasilPenilaian,
          detik: terpakai,
          benih: benihTeks,
        },
        pilih,
      );
      kabarEkspor = { teks: `${pilih(T.diunduh)}: ${nama}`, benar: true };
    } catch (galat) {
      // Unduhan bisa ditolak peramban atau kebijakan perangkat. Diam bukan
      // pilihan: pengguna yang menekan tombol dan tidak melihat apa pun akan
      // menekannya lagi, lalu menyimpulkan situsnya rusak.
      kabarEkspor = {
        teks: `${pilih(T.unduhanDitolak)}: ${String(galat)}`,
        benar: false,
      };
    }
  }

  let ulanganJadwal = $state(10);
  let salahDiUlangan = $state(5);

  const benih = $derived.by(() => {
    // Benih diterima sebagai teks supaya angka besar tidak kehilangan
    // ketelitian lewat `Number`. Teks yang bukan angka jatuh ke nol, bukan
    // menabrak: benih adalah kenyamanan, bukan masukan yang harus dijaga.
    try {
      return BigInt(benihTeks.trim() || "0");
    } catch {
      return 0n;
    }
  });

  const tersedia = $derived(
    sesiTerpilih === undefined ? BANK.length : BANK.filter((s) => s.sesi === sesiTerpilih).length,
  );

  const ringkasan = $derived<Ringkasan>(rangkum(hasilSoal, hasilPenilaian));

  /** Sedang menunggu pembahasan diunduh. Menonaktifkan tombol mulai. */
  let memuat = $state(false);

  /**
   * Memulai sesi, sesudah pembahasannya siap.
   *
   * Pembahasan diunduh terpisah dari banknya dan ditunggu di sini — bukan di
   * layar ujian — supaya tidak pernah ada soal yang dijawab sebelum
   * penjelasannya bisa ditampilkan. Pada titik ini penggunanya baru saja
   * menekan tombol dan memang sedang menunggu; sesudah layar ujian terbuka,
   * ia sudah membaca soal dan menunggu apa pun terasa seperti kerusakan.
   *
   * Seluruh jalan menuju layar ujian lewat sini, termasuk "ulangi sesi" dan
   * tombol latihan di halaman materi. Satu jalan yang melewatinya sudah cukup
   * untuk menghasilkan ujian tanpa pembahasan.
   */
  async function mulai() {
    memuat = true;
    try {
      await muatPembahasan();
    } finally {
      memuat = false;
    }
    layar = "ujian";
  }

  /**
   * Ketiga situs saudara, beserta bahasa yang dipakainya.
   *
   * Ada di antarmuka, bukan hanya di README: README dibaca orang yang sudah
   * menemukan repositorinya. Pengunjung yang mendarat di sini tidak punya satu
   * pun petunjuk bahwa tiga situs lain mengerjakan silabus yang sama dalam
   * bahasa lain, atau bahwa mesin Swift di balik bank soal ini salah satu dari
   * enam implementasi yang saling diadu.
   *
   * Bahasanya ikut disebut karena itulah yang membedakan keempatnya. Empat
   * tautan tanpa keterangan hanya terbaca sebagai empat alamat.
   */
  const SAUDARA = [
    { nama: "ai-atlas", bahasa: "Rust", alamat: "https://xyb3rpunq.github.io/ai-atlas/" },
    {
      nama: "kecerdasan-buatan",
      bahasa: "Lua",
      alamat: "https://xyb3rpunq.github.io/kecerdasan-buatan/",
    },
    { nama: "neuronusa", bahasa: "Python", alamat: "https://xyb3rpunq.github.io/neuronusa/" },
  ];

  function selesai(soal: Soal[], penilaian: Penilaian[], detik: number) {
    hasilSoal = soal;
    hasilPenilaian = penilaian;
    terpakai = detik;
    layar = "hasil";
    globalThis.scrollTo({ top: 0 });
  }


  const salahDijawab = $derived(
    hasilPenilaian
      .map((p, i) => ({ p, s: hasilSoal[i] }))
      .filter((x) => !x.p.benar && x.s !== undefined),
  );
</script>

<a class="lewati" href="#isi">{pilih(T.lewatiKeIsi)}</a>

<header class="kepala">
  <div class="kepala__isi">
    <a class="merek" href="#/" onclick={() => (layar = "beranda")}>
      <svg class="merek__tanda" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4" y="5" width="24" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2.2" />
        <path d="M10 13h12M10 18h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="16" cy="2.5" r="0" fill="currentColor" />
      </svg>
      <span>
        IND323 AI Lab
        <span class="merek__sub">{pilih(T.merekSub)}</span>
      </span>
    </a>
    <div class="baris" style="margin: 0">
      <button
        type="button"
        class="tombol"
        aria-pressed={layar === "beranda" || layar === "ujian" || layar === "hasil"}
        onclick={() => (layar = "beranda")}>{pilih(T.latihan)}</button
      >
      <button
        type="button"
        class="tombol"
        aria-pressed={layar === "materi"}
        onclick={() => (layar = "materi")}>{pilih(T.materi)}</button
      >
      <button
        type="button"
        class="tombol"
        aria-pressed={layar === "presentasi"}
        title={pilih(T.ajarJudul)}
        onclick={() => (layar = "presentasi")}>{pilih(T.ajar)}</button
      >
      <!--
        Pemilih bahasa memakai nama bahasanya sendiri, bukan bendera. Bendera
        menandai negara, bukan bahasa — dan bahasa Inggris tidak dimiliki satu
        negara pun.
      -->
      <div class="pilih-bahasa" role="group" aria-label={pilih(T.bahasa)}>
        <button
          type="button"
          class="tombol"
          aria-pressed={bahasa() === "id"}
          onclick={() => aturBahasa("id")}>ID</button
        >
        <button
          type="button"
          class="tombol"
          aria-pressed={bahasa() === "en"}
          onclick={() => aturBahasa("en")}>EN</button
        >
      </div>
    </div>
  </div>
</header>

{#if layar === "presentasi"}
  <Presentasi onKeluar={() => (layar = "materi")} />
{/if}

<main class="wadah" id="isi" hidden={layar === "presentasi"}>
  {#if layar === "beranda"}
    <header style="margin-bottom: 1.6rem">
      <h1>{pilih(T.judulBeranda)}</h1>
      <p style="color: var(--teks-2); max-width: 60ch">
        {pilih(T.berandaIntro).replace("%N", String(BANK.length))}
      </p>
      <p style="color: var(--teks-3); font-size: 0.88rem; max-width: 60ch">
        {pilih(T.berandaBenih)}
      </p>
    </header>

    <div class="kartu">
      <h2 class="kartu__judul">{pilih(T.susunSesi)}</h2>

      <label class="bidang">
        <span class="bidang__label"
          >{pilih(T.jumlahSoal)} — {tersedia} {pilih(T.tersedia)}</span
        >
        <input type="number" min="1" max={Math.max(1, tersedia)} bind:value={banyak} />
      </label>

      <label class="bidang">
        <span class="bidang__label">{pilih(T.benihAcak)}</span>
        <input type="text" inputmode="numeric" bind:value={benihTeks} />
      </label>

      <div class="bidang">
        <span class="bidang__label">{pilih(T.batasiSesi)}</span>
        <div class="baris">
          <button
            type="button"
            class="tombol"
            aria-pressed={sesiTerpilih === undefined}
            onclick={() => (sesiTerpilih = undefined)}>{pilih(T.semuaSesi)}</button
          >
          {#each SESI as s (s.nomor)}
            <button
              type="button"
              class="tombol"
              aria-pressed={sesiTerpilih === s.nomor}
              onclick={() => (sesiTerpilih = s.nomor)}
              title={pilih(s.nama)}>{String(s.nomor).padStart(2, "0")}</button
            >
          {/each}
        </div>
        {#if sesiTerpilih !== undefined}
          <p class="catatan">
            {pilih(SESI.find((s) => s.nomor === sesiTerpilih)?.nama ?? bi('', ''))}
          </p>
        {/if}
      </div>

      <div class="baris">
        <button
          type="button"
          class="tombol tombol--utama"
          disabled={tersedia === 0 || memuat}
          onclick={mulai}
        >
          {pilih(T.mulai)} — {Math.min(banyak, tersedia)}
          {pilih(T.soal)}, {jam(Math.min(banyak, tersedia) * 90)}
        </button>
      </div>
      <p class="catatan">{pilih(T.catatanPewaktu)}</p>
    </div>

    <div class="kartu">
      <h2 class="kartu__judul">{pilih(T.cakupanBank)}</h2>
      <PetaBank />
    </div>

    <div class="kartu">
      <h2 class="kartu__judul">{pilih(T.kapanMuncul)}</h2>
      <p class="catatan">{pilih(T.catatanSm2)}</p>

      <div class="baris baris--rapat">
        <label class="bidang">
          <span class="bidang__label">
            {pilih(T.berapaKaliDijawab)}
            <span class="angka-mono">{ulanganJadwal}</span>
          </span>
          <input type="range" min="4" max="14" step="1" bind:value={ulanganJadwal} />
        </label>
        <label class="bidang">
          <span class="bidang__label">
            {pilih(T.salahDiUlanganKe)}
            <span class="angka-mono"
              >{salahDiUlangan === 0 ? pilih(T.tidakAda) : salahDiUlangan}</span
            >
          </span>
          <input
            type="range"
            min="0"
            max={ulanganJadwal}
            step="1"
            bind:value={salahDiUlangan}
          />
        </label>
      </div>

      <KurvaJadwal
        banyakUlangan={ulanganJadwal}
        salahDiUlangan={Math.min(salahDiUlangan, ulanganJadwal)}
      />

      <p class="catatan">{pilih(T.catatanDuaKali)}</p>
    </div>

    <div class="kartu saudara">
      <h2 class="kartu__judul">{pilih(T.keluargaJudul)}</h2>
      <p class="catatan">{pilih(T.keluargaIsi)}</p>
      <div class="saudara__daftar">
        {#each SAUDARA as x (x.nama)}
          <a class="saudara__butir" href={x.alamat} rel="noopener">
            <span class="saudara__nama">{x.nama}</span>
            <span class="saudara__bahasa">{x.bahasa}</span>
          </a>
        {/each}
      </div>
      <p class="catatan">
        {pilih(T.keluargaTaut)}
        <a href="https://xyb3rpunq.github.io/ai-atlas/#/enam-bahasa" rel="noopener">
          {pilih(T.keluargaHalaman)}</a
        >.
      </p>
    </div>

    <div class="kartu">
      <h2 class="kartu__judul">{pilih(T.sebaranSesi)}</h2>
      <ul class="petak">
        {#each SESI as s (s.nomor)}
          {@const jumlah = BANK.filter((x) => x.sesi === s.nomor).length}
          <li>
            <a
              href="#/"
              onclick={(e) => {
                e.preventDefault();
                sesiTerpilih = s.nomor;
                banyak = Math.max(1, jumlah);
              }}
            >
              <div class="petak__nomor">
                {pilih(T.sesi).toUpperCase()}
                {String(s.nomor).padStart(2, "0")}
              </div>
              <div class="petak__nama">{s.nama}</div>
              <div class="petak__jumlah">{pilih(T.petakSoal).replace("%N", String(jumlah))}</div>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {:else if layar === "ujian"}
    <Ujian
      banyak={Math.min(banyak, tersedia)}
      {benih}
      {sesiTerpilih}
      onSelesai={selesai}
    />
  {:else if layar === "hasil"}
    <div class="kartu" style="text-align: center">
      <div class="kartu__judul">{pilih(T.nilaiAkhir)}</div>
      <div class="nilai-besar">{ringkasan.nilai.toFixed(0)}</div>
      <p class="catatan">
        <!--
          Kalimatnya dirakit dari satu untai bertanda, bukan dari potongan yang
          disambung di templat. Urutan kata bahasa Inggris dan Indonesia
          berbeda, dan potongan yang disambung memaksa keduanya memakai urutan
          yang sama — sehingga salah satunya pasti terbaca janggal.
        -->
        {pilih(T.ringkasHasil)
          .replace("%B", String(ringkasan.benar))
          .replace("%T", String(ringkasan.total))
          .replace("%W", jam(terpakai))}
        {pilih(T.ringkasBenih).replace("%S", benihTeks)}
      </p>
    </div>

    {#if ringkasan.perTopik.length > 0}
      <div class="kartu">
        <h2 class="kartu__judul">{pilih(T.ketepatanTopik)}</h2>
        <BatangTopik perTopik={ringkasan.perTopik} />
      </div>
    {/if}

    {#if salahDijawab.length > 0}
      <div class="kartu">
        <h2 class="kartu__judul">{pilih(T.perluDiulang)}</h2>
        {#each salahDijawab as x (x.p.kode)}
          <div style="padding: 0.7rem 0; border-bottom: 1px solid var(--garis)">
            <div class="langkah-nomor">
              {pilih(T.sesi)}
              {String(x.s!.sesi).padStart(2, "0")} · {pilih(namaTopik(x.s!.topik))}
            </div>
            <p style="margin: 0.3rem 0 0.4rem">{pilih(x.s!.pertanyaan)}</p>
            <div class="catatan">{pilih(pembahasanDari(x.p.kode))}</div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="kartu">
      <h2 class="kartu__judul">{pilih(T.simpanHasil)}</h2>
      <p class="catatan">{pilih(T.catatanEkspor)}</p>
      <div class="baris">
        <button type="button" class="tombol" onclick={padaUnduhRapor}>
          {pilih(T.unduhCsv)}
        </button>
        <button type="button" class="tombol" onclick={() => globalThis.print()}>
          {pilih(T.cetakPdf)}
        </button>
      </div>
      <div class="ekspor__kabar" aria-live="polite">
        {#if kabarEkspor}
          <span class={kabarEkspor.benar ? "kabar kabar--benar" : "kabar"}>
            {kabarEkspor.teks}
          </span>
        {/if}
      </div>
    </div>

    <div class="baris">
      <button
        type="button"
        class="tombol tombol--utama"
        disabled={memuat}
        onclick={mulai}>{pilih(T.ulangiSesi)}</button
      >
      <button
        type="button"
        class="tombol"
        disabled={memuat}
        onclick={() => {
          benihTeks = String(Number(benihTeks || "0") + 1);
          void mulai();
        }}>{pilih(T.sesiBaru)}</button
      >
      <button type="button" class="tombol" onclick={() => (layar = "beranda")}>
        {pilih(T.kembali)}
      </button>
    </div>
  {:else}
    <header style="margin-bottom: 1.4rem">
      <h1>{pilih(T.judulMateri)}</h1>
      <p style="color: var(--teks-2); max-width: 60ch">{pilih(T.ringkasMateri)}</p>
    </header>

    <div class="kartu">
      <div class="baris" style="margin: 0">
        {#each SESI as s (s.nomor)}
          <button
            type="button"
            class="tombol"
            aria-pressed={sesiMateri === s.nomor}
            onclick={() => (sesiMateri = s.nomor)}
            title={pilih(s.nama)}>{String(s.nomor).padStart(2, "0")}</button
          >
        {/each}
      </div>
    </div>

    {#each MATERI.filter((m) => m.sesi === sesiMateri) as m (m.sesi)}
      <div class="kartu">
        <div class="langkah-nomor">
          {pilih(T.sesi)}
          {String(m.sesi).padStart(2, "0")}
        </div>
        <h2 style="margin: 0.2rem 0 0.8rem">{pilih(m.judul)}</h2>
        <p>{pilih(m.inti)}</p>

        <h3 style="margin-top: 1.2rem; font-size: 0.95rem">{pilih(T.seringKeliru)}</h3>
        <p class="catatan">{pilih(m.keliru)}</p>

        <h3 style="margin-top: 1.2rem; font-size: 0.95rem">{pilih(T.biasanyaDiuji)}</h3>
        <p class="catatan">{pilih(m.diuji)}</p>

        {#if m.rumus.length > 0}
          <h3 style="margin-top: 1.2rem; font-size: 0.95rem">{pilih(T.rumusDiingat)}</h3>
          <div class="gulir-x">
            <table>
              <thead>
                <tr><th>{pilih(T.nama)}</th><th>{pilih(T.rumus)}</th></tr>
              </thead>
              <tbody>
                {#each m.rumus as r (r.ekspresi)}
                  <tr><td>{pilih(r.nama)}</td><td><code>{r.ekspresi}</code></td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        <div class="baris">
          <button
            type="button"
            class="tombol tombol--utama"
            disabled={memuat}
            onclick={() => {
              sesiTerpilih = m.sesi;
              banyak = Math.max(1, BANK.filter((x) => x.sesi === m.sesi).length);
              void mulai();
            }}
          >
            {pilih(T.latihanSesiIni)} — {BANK.filter((x) => x.sesi === m.sesi).length}
            {pilih(T.soal)}
          </button>
        </div>
      </div>
    {/each}
  {/if}
</main>

<footer class="kaki">
  <div class="kaki__isi">
    <span>{pilih(T.dibuatOleh)} <strong>.Deckyx</strong> — Daniel Hutajulu</span>
    <span>{pilih(T.mesinSwift)}</span>
    <a href="https://github.com/xyb3rpunq/ind323-ai-lab" rel="noopener">{pilih(T.kodeSumber)}</a>
  </div>
</footer>
