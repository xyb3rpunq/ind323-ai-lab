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

  type Layar = "beranda" | "ujian" | "hasil" | "materi";

  let layar = $state<Layar>("beranda");
  let banyak = $state(10);
  let benihTeks = $state("2026");
  let sesiTerpilih = $state<number | undefined>(undefined);

  let hasilSoal = $state<Soal[]>([]);
  let hasilPenilaian = $state<Penilaian[]>([]);
  let terpakai = $state(0);
  let sesiMateri = $state<number>(1);

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

  function warnaTopik(bagian: number): string {
    if (bagian >= 0.8) return "var(--benar)";
    if (bagian >= 0.5) return "var(--aksen)";
    return "var(--salah)";
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
        onclick={() => (layar = "beranda")}>Latihan</button
      >
      <button
        type="button"
        class="tombol"
        aria-pressed={layar === "materi"}
        onclick={() => (layar = "materi")}>Materi</button
      >
    </div>
  </div>
</header>

<main class="wadah" id="isi">
  {#if layar === "beranda"}
    <header style="margin-bottom: 1.6rem">
      <h1>Bank soal IND323 dengan pewaktu</h1>
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
      <h2 class="kartu__judul">Susun sesi</h2>

      <label class="bidang">
        <span class="bidang__label">Jumlah soal — {tersedia} tersedia</span>
        <input type="number" min="1" max={Math.max(1, tersedia)} bind:value={banyak} />
      </label>

      <label class="bidang">
        <span class="bidang__label">
          Benih acak — sesi dengan benih sama selalu identik
        </span>
        <input type="text" inputmode="numeric" bind:value={benihTeks} />
      </label>

      <div class="bidang">
        <span class="bidang__label">Batasi ke satu sesi kuliah</span>
        <div class="baris">
          <button
            type="button"
            class="tombol"
            aria-pressed={sesiTerpilih === undefined}
            onclick={() => (sesiTerpilih = undefined)}>Semua sesi</button
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
          Mulai — {Math.min(banyak, tersedia)} soal, {jam(Math.min(banyak, tersedia) * 90)}
        </button>
      </div>
      <p class="catatan">
        Waktunya 90 detik per soal, dihitung untuk seluruh sesi sekaligus. Pewaktu
        per soal memaksa ritme yang seragam, padahal soal berhitung memang butuh
        lebih lama daripada soal ingatan.
      </p>
    </div>

    <div class="kartu">
      <h2 class="kartu__judul">Sebaran soal per sesi</h2>
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
      <div class="kartu__judul">Nilai akhir</div>
      <div class="nilai-besar">{ringkasan.nilai.toFixed(0)}</div>
      <p class="catatan">
        {ringkasan.benar} benar dari {ringkasan.total} soal, dikerjakan dalam {jam(terpakai)}.
        Benih {benihTeks} — pakai benih yang sama untuk mengulang sesi ini persis.
      </p>
    </div>

    {#if ringkasan.perTopik.length > 0}
      <div class="kartu">
        <h2 class="kartu__judul">Ketepatan per topik — yang terlemah lebih dulu</h2>
        {#each ringkasan.perTopik as t (t.topik)}
          {@const bagian = t.benar / t.total}
          <div class="topik-baris">
            <span>{t.topik}</span>
            <span class="angka-mono">{t.benar}/{t.total}</span>
            <div class="topik-bilah">
              <span style="width: {bagian * 100}%; background: {warnaTopik(bagian)}"></span>
            </div>
          </div>
        {/each}
        <p class="catatan">
          Diurutkan menurut ketepatan menaik, bukan menurut nama. Bagian yang paling
          perlu diulang harus muncul lebih dulu, bukan tenggelam di tengah daftar.
        </p>
      </div>
    {/if}

    {#if salahDijawab.length > 0}
      <div class="kartu">
        <h2 class="kartu__judul">Yang perlu diulang</h2>
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
        }}>Ulangi sesi yang sama</button
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
        Kembali
      </button>
    </div>
  {:else}
    <header style="margin-bottom: 1.4rem">
      <h1>Ringkasan materi per sesi</h1>
      <p style="color: var(--teks-2); max-width: 60ch">
        Bukan salinan modul. Tiap sesi diringkas menjadi satu gagasan pokok, hal yang
        paling sering keliru dipahami, dan apa yang sebenarnya diuji.
      </p>
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
        <div class="langkah-nomor">Sesi {String(m.sesi).padStart(2, "0")}</div>
        <h2 style="margin: 0.2rem 0 0.8rem">{m.judul}</h2>
        <p>{m.inti}</p>

        <h3 style="margin-top: 1.2rem; font-size: 0.95rem">Yang paling sering keliru</h3>
        <p class="catatan">{m.keliru}</p>

        <h3 style="margin-top: 1.2rem; font-size: 0.95rem">Yang biasanya diuji</h3>
        <p class="catatan">{m.diuji}</p>

        {#if m.rumus.length > 0}
          <h3 style="margin-top: 1.2rem; font-size: 0.95rem">Rumus yang perlu diingat</h3>
          <div class="gulir-x">
            <table>
              <thead>
                <tr><th>Nama</th><th>Rumus</th></tr>
              </thead>
              <tbody>
                {#each m.rumus as r (r.nama)}
                  <tr><td>{r.nama}</td><td><code>{r.ekspresi}</code></td></tr>
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
            Latihan sesi ini — {BANK.filter((x) => x.sesi === m.sesi).length} soal
          </button>
        </div>
      </div>
    {/each}
  {/if}
</main>

<footer class="kaki">
  <div class="kaki__isi">
    <span>Dibuat oleh <strong>.Deckyx</strong> — Daniel Hutajulu</span>
    <span>Mesin dan kunci jawabannya ditulis dalam Swift.</span>
    <a href="https://github.com/xyb3rpunq/ind323-ai-lab" rel="noopener">Kode sumber</a>
  </div>
</footer>
