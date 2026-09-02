<!--
  Kerangka aplikasi.

  Perutean memakai tanda pagar karena situsnya terbit di GitHub Pages, yang
  tidak bisa disetel mengarahkan seluruh jalur ke satu berkas.

  .Deckyx
-->
<script lang="ts">
  import Ujian from "./lib/Ujian.svelte";
  import { BANK, SESI, jam, rangkum } from "./bank";
  import type { Penilaian, Ringkasan, Soal } from "./bank";
  import { MATERI } from "./materi";
  import BatangTopik from "./viz/BatangTopik.svelte";
  import KurvaJadwal from "./viz/KurvaJadwal.svelte";
  import PetaBank from "./viz/PetaBank.svelte";
  import Presentasi from "./lib/Presentasi.svelte";
  import { T, aturBahasa, bahasa, pilih, pulihkanBahasa } from "./i18n.svelte";

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

  function mulai() {
    layar = "ujian";
  }

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

<a class="lewati" href="#isi">Lewati ke isi</a>

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
        <span class="merek__sub">Pendamping kuliah &amp; bank soal</span>
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
        {BANK.length} soal dari 14 sesi kuliah. Kunci jawaban soal berhitung
        <strong>dihitung mesin</strong>, bukan diketik tangan — mesinnya ditulis dalam
        Swift dan sudah diadu dengan empat implementasi lain sampai cocok bit demi bit.
      </p>
      <p style="color: var(--teks-3); font-size: 0.88rem; max-width: 60ch">
        Sesi berbenih sama selalu berisi soal yang sama dalam urutan yang sama, jadi
        Anda bisa mengulanginya setelah mempelajari kesalahannya.
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
              title={s.nama}>{String(s.nomor).padStart(2, "0")}</button
            >
          {/each}
        </div>
        {#if sesiTerpilih !== undefined}
          <p class="catatan">
            {SESI.find((s) => s.nomor === sesiTerpilih)?.nama}
          </p>
        {/if}
      </div>

      <div class="baris">
        <button
          type="button"
          class="tombol tombol--utama"
          disabled={tersedia === 0}
          onclick={mulai}
        >
          {pilih(T.mulai)} — {Math.min(banyak, tersedia)}
          {pilih(T.soal)}, {jam(Math.min(banyak, tersedia) * 90)}
        </button>
      </div>
      <p class="catatan">
        Waktunya 90 detik per soal, dihitung untuk seluruh sesi sekaligus. Pewaktu
        per soal memaksa ritme yang seragam, padahal soal berhitung memang butuh
        lebih lama daripada soal ingatan.
      </p>
    </div>

    <div class="kartu">
      <h2 class="kartu__judul">{pilih(T.cakupanBank)}</h2>
      <PetaBank />
    </div>

    <div class="kartu">
      <h2 class="kartu__judul">{pilih(T.kapanMuncul)}</h2>
      <p class="catatan">
        Situs ini memakai penjadwal SM-2 — algoritma pengulangan berjarak yang
        sama dengan yang dipakai SuperMemo dan Anki. Ia menunda soal yang sudah
        dikuasai supaya waktunya bisa dipakai untuk soal yang belum, dan
        menjatuhkan jaraknya kembali ke satu hari begitu sebuah soal terjawab
        salah. Geser kendali di bawah untuk melihat harga satu kesalahan.
      </p>

      <div class="baris baris--rapat">
        <label class="bidang">
          <span class="bidang__label">
            Berapa kali dijawab <span class="angka-mono">{ulanganJadwal}</span>
          </span>
          <input type="range" min="4" max="14" step="1" bind:value={ulanganJadwal} />
        </label>
        <label class="bidang">
          <span class="bidang__label">
            Salah di ulangan ke <span class="angka-mono"
              >{salahDiUlangan === 0 ? "tidak ada" : salahDiUlangan}</span
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

      <p class="catatan">
        Algoritmanya ditulis dua kali: sekali di Swift sebagai sumber kebenaran,
        sekali di TypeScript supaya kurva ini bisa digambar di peramban.
        Keduanya diadu di CI — pola bit demi pola bit, termasuk faktor
        kemudahannya. Kurva yang digambar dari salinan yang menyimpang akan
        mengajarkan algoritma yang bukan algoritma situs ini.
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
              <div class="petak__nomor">SESI {String(s.nomor).padStart(2, "0")}</div>
              <div class="petak__nama">{s.nama}</div>
              <div class="petak__jumlah">{jumlah} soal</div>
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
        {ringkasan.benar} benar dari {ringkasan.total} soal, dikerjakan dalam {jam(terpakai)}.
        Benih {benihTeks} — pakai benih yang sama untuk mengulang sesi ini persis.
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
              Sesi {String(x.s!.sesi).padStart(2, "0")} · {x.s!.topik}
            </div>
            <p style="margin: 0.3rem 0 0.4rem">{x.s!.pertanyaan}</p>
            <div class="catatan">{x.s!.pembahasan}</div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="baris">
      <button
        type="button"
        class="tombol tombol--utama"
        onclick={() => {
          layar = "ujian";
        }}>{pilih(T.ulangiSesi)}</button
      >
      <button
        type="button"
        class="tombol"
        onclick={() => {
          benihTeks = String(Number(benihTeks || "0") + 1);
          layar = "ujian";
        }}>Sesi baru</button
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
            title={s.nama}>{String(s.nomor).padStart(2, "0")}</button
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
            onclick={() => {
              sesiTerpilih = m.sesi;
              banyak = Math.max(1, BANK.filter((x) => x.sesi === m.sesi).length);
              layar = "ujian";
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
