<!--
  Mode presentasi: bahan ajar yang siap diproyeksikan di depan kelas.

  # Yang membedakannya dari halaman materi biasa

  Halaman materi dibaca sendiri, dari jarak setengah meter, oleh orang yang
  sedang tidak melakukan apa-apa selain membaca. Salindia dibaca dari lima
  meter oleh orang yang juga sedang mendengarkan. Keduanya menuntut hal yang
  berlawanan, dan memakai satu tata letak untuk keduanya berarti keduanya
  buruk.

  Yang berubah di sini: satu gagasan per layar, huruf yang cukup besar untuk
  proyektor termurah, kontras yang tidak bergantung pada ruangan yang gelap,
  dan kendali yang seluruhnya bisa dijangkau papan tik — karena penyaji yang
  sedang berbicara tidak bisa mencari tetikus.

  # Kenapa nomor salindia masuk ke alamat

  Supaya sebuah salindia bisa ditautkan, dan supaya presentasi yang terputus
  bisa dilanjutkan dari tempatnya berhenti. Proyektor mati di tengah kuliah
  adalah kejadian biasa; kehilangan tempat karenanya tidak perlu.

  .Deckyx
-->
<script lang="ts">
  import { onMount } from "svelte";

  import KurvaJadwal from "../viz/KurvaJadwal.svelte";
  import PetaBank from "../viz/PetaBank.svelte";
  import { penandaSesi, susunSalindia, type Salindia } from "./slide";
  import { T, pilih } from "../i18n.svelte";

  interface Props {
    onKeluar: () => void;
  }

  const { onKeluar }: Props = $props();

  const salindia: Salindia[] = susunSalindia();
  const penanda = penandaSesi(salindia);

  let indeks = $state(0);
  let catatanTampil = $state(false);
  let bantuanTampil = $state(false);
  let daftarTampil = $state(false);
  let layarPenuh = $state(false);

  const sekarang = $derived(salindia[Math.min(indeks, salindia.length - 1)]!);
  const kemajuan = $derived(((indeks + 1) / salindia.length) * 100);

  function keSalindia(i: number) {
    indeks = Math.min(Math.max(i, 0), salindia.length - 1);
    daftarTampil = false;
    // Nomornya disimpan di alamat supaya bisa ditautkan dan dilanjutkan.
    // `replaceState`, bukan `pushState`: menekan panah tiga puluh kali tidak
    // boleh berarti menekan tombol kembali tiga puluh kali untuk keluar.
    history.replaceState(history.state, "", `#/presentasi/${indeks + 1}`);
  }

  function maju() {
    keSalindia(indeks + 1);
  }
  function mundur() {
    keSalindia(indeks - 1);
  }

  async function togelLayarPenuh() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Sebagian peramban dan sebagian kebijakan menolak layar penuh. Itu
      // bukan alasan untuk menghentikan presentasi; salindianya tetap terbaca
      // di jendela biasa.
    }
  }

  function padaTombol(ev: KeyboardEvent) {
    // Papan tik penyaji jauh lebih penting daripada tetikusnya: orang yang
    // sedang berbicara di depan kelas tidak bisa mencari kursor.
    if (ev.key === "ArrowRight" || ev.key === "PageDown" || ev.key === " ") {
      ev.preventDefault();
      maju();
    } else if (ev.key === "ArrowLeft" || ev.key === "PageUp") {
      ev.preventDefault();
      mundur();
    } else if (ev.key === "Home") {
      ev.preventDefault();
      keSalindia(0);
    } else if (ev.key === "End") {
      ev.preventDefault();
      keSalindia(salindia.length - 1);
    } else if (ev.key === "f" || ev.key === "F") {
      void togelLayarPenuh();
    } else if (ev.key === "n" || ev.key === "N") {
      catatanTampil = !catatanTampil;
    } else if (ev.key === "d" || ev.key === "D") {
      daftarTampil = !daftarTampil;
    } else if (ev.key === "?") {
      bantuanTampil = !bantuanTampil;
    } else if (ev.key === "Escape") {
      if (daftarTampil || bantuanTampil) {
        daftarTampil = false;
        bantuanTampil = false;
      } else if (!document.fullscreenElement) {
        onKeluar();
      }
    }
  }

  onMount(() => {
    const cocok = /#\/presentasi\/(\d+)/.exec(location.hash);
    if (cocok) indeks = Math.min(Math.max(Number(cocok[1]) - 1, 0), salindia.length - 1);
    else keSalindia(0);

    const perbaruiLayarPenuh = () => {
      layarPenuh = document.fullscreenElement !== null;
    };
    document.addEventListener("fullscreenchange", perbaruiLayarPenuh);
    return () => document.removeEventListener("fullscreenchange", perbaruiLayarPenuh);
  });
</script>

<svelte:window onkeydown={padaTombol} />

<div class="deck" class:deck--penuh={layarPenuh}>
  <div class="deck__kemajuan" style="width: {kemajuan}%"></div>

  <!--
    Seluruh bidang salindia bisa diklik untuk maju, dan itu memang perilaku
    yang diharapkan penyaji. Ia tetap `button` supaya papan tik dan pembaca
    layar memperlakukannya sebagai kendali, bukan sebagai hiasan.
  -->
  <button class="deck__bidang" type="button" onclick={maju} aria-label={pilih(T.salindiaBerikutnya)}>
    <article class="salindia salindia--{sekarang.jenis}" aria-live="polite">
      {#if sekarang.kaki}
        <p class="salindia__kaki">{pilih(sekarang.kaki)}</p>
      {/if}

      <h2 class="salindia__judul">{pilih(sekarang.judul)}</h2>

      {#if sekarang.jenis === "rumus" && sekarang.rumus}
        <ul class="rumus">
          {#each sekarang.rumus as r (r.ekspresi)}
            <li>
              <span class="rumus__nama">{pilih(r.nama)}</span>
              <code class="rumus__ekspresi">{r.ekspresi}</code>
            </li>
          {/each}
        </ul>
      {:else if sekarang.jenis === "gambar"}
        <div class="salindia__gambar">
          {#if sekarang.gambar === "petaBank"}
            <PetaBank />
          {:else if sekarang.gambar === "kurvaJadwal"}
            <KurvaJadwal banyakUlangan={10} salahDiUlangan={5} />
          {/if}
        </div>
      {:else if sekarang.isi}
        <p class="salindia__isi">{pilih(sekarang.isi)}</p>
      {/if}
    </article>
  </button>

  {#if catatanTampil && sekarang.catatan}
    <aside class="catatan-pengajar">
      <h3>{pilih(T.catatanPengajar)}</h3>
      <p>{pilih(sekarang.catatan)}</p>
    </aside>
  {/if}

  <nav class="deck__kaki" aria-label={pilih(T.kendaliPresentasi)}>
    <div class="deck__kiri">
      <button type="button" class="tombol-kecil" onclick={onKeluar}>{pilih(T.keluar)}</button>
      <button type="button" class="tombol-kecil" onclick={() => (daftarTampil = !daftarTampil)}>
        {pilih(T.daftarSesi)}
      </button>
      <button
        type="button"
        class="tombol-kecil"
        aria-pressed={catatanTampil}
        onclick={() => (catatanTampil = !catatanTampil)}>{pilih(T.catatan)}</button
      >
      <button type="button" class="tombol-kecil" onclick={togelLayarPenuh}>
        {layarPenuh ? pilih(T.keluarLayarPenuh) : pilih(T.layarPenuh)}
      </button>
    </div>

    <div class="deck__kanan">
      <button type="button" class="tombol-kecil" onclick={mundur} disabled={indeks === 0}>
        ‹
      </button>
      <span class="deck__cacah">{indeks + 1} / {salindia.length}</span>
      <button
        type="button"
        class="tombol-kecil"
        onclick={maju}
        disabled={indeks === salindia.length - 1}>›</button
      >
      <button type="button" class="tombol-kecil" onclick={() => (bantuanTampil = true)}>
        ?
      </button>
    </div>
  </nav>

  {#if daftarTampil}
    <div class="lapis">
      <div class="lapis__kotak">
        <h3>{pilih(T.daftarSesi)}</h3>
        <ul class="daftar-sesi">
          {#each penanda as p (p.sesi)}
            <li>
              <button type="button" onclick={() => keSalindia(p.indeks)}>
                <span class="daftar-sesi__nomor">{String(p.sesi).padStart(2, "0")}</span>
                {pilih(p.judul)}
              </button>
            </li>
          {/each}
        </ul>
        <button type="button" class="tombol-kecil" onclick={() => (daftarTampil = false)}>
          {pilih(T.tutup)}
        </button>
      </div>
    </div>
  {/if}

  {#if bantuanTampil}
    <div class="lapis">
      <div class="lapis__kotak">
        <h3>{pilih(T.pintasan)}</h3>
        <dl class="pintasan">
          <dt>→ · spasi · PageDown</dt>
          <dd>salindia berikutnya</dd>
          <dt>← · PageUp</dt>
          <dd>salindia sebelumnya</dd>
          <dt>Home · End</dt>
          <dd>awal · akhir</dd>
          <dt>F</dt>
          <dd>layar penuh</dd>
          <dt>N</dt>
          <dd>catatan pengajar</dd>
          <dt>D</dt>
          <dd>daftar sesi</dd>
          <dt>Esc</dt>
          <dd>tutup lapisan, atau keluar</dd>
        </dl>
        <p class="catatan">
          Nomor salindia tersimpan di alamat. Kalau proyektornya mati, muat ulang
          halamannya dan presentasi lanjut dari tempatnya berhenti.
        </p>
        <button type="button" class="tombol-kecil" onclick={() => (bantuanTampil = false)}>
          {pilih(T.tutup)}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .deck {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--latar);
    display: grid;
    grid-template-rows: auto 1fr auto;
    color: var(--teks);
  }

  .deck__kemajuan {
    height: 3px;
    background: var(--aksen);
    transition: width 0.18s ease;
  }

  .deck__bidang {
    /* Bidang salindia adalah tombol supaya bisa dijangkau papan tik, tetapi
       tidak boleh terlihat seperti tombol. */
    appearance: none;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    display: grid;
    place-items: center;
    padding: 2vh 4vw;
    overflow-y: auto;
    /* Wajib. Butir grid bawaannya `min-height: auto`, artinya ia menolak
       menyusut di bawah tinggi isinya — jadi baris `1fr` justru tumbuh
       melebihi layar, `overflow-y` tidak pernah aktif, dan kaki kendalinya
       terdorong keluar pandangan. Di depan kelas itu berarti penyaji
       kehilangan seluruh tombolnya. */
    min-height: 0;
  }

  .salindia {
    width: min(1100px, 100%);
    max-height: 100%;
  }

  .salindia__kaki {
    margin: 0 0 1.2vh;
    font-size: clamp(0.78rem, 1.9vh, 1.1rem);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--teks-3);
  }

  /* Ukuran huruf mengikuti tinggi layar, bukan lebarnya. Proyektor kelas
     hampir selalu lebih pendek daripada monitor dengan lebar yang sama, dan
     salindia yang dipatok ke lebar akan terpotong di bawah. */
  .salindia__judul {
    margin: 0;
    font-size: clamp(2rem, 6vh, 4.2rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .salindia__isi {
    margin: 2.4vh 0 0;
    font-size: clamp(1.15rem, 3.4vh, 2.3rem);
    line-height: 1.5;
    color: var(--teks-2);
    /* Panjang barisnya dibatasi, bukan lebarnya. Baris sepanjang layar
       proyektor memaksa mata melompat jauh di tiap pergantian baris, dan
       hadirin kehilangan tempatnya — persis masalah yang tidak akan pernah
       dialami penulisnya, yang membacanya di layar sendiri. */
    max-width: 24ch;
    max-width: min(24em, 100%);
  }

  .salindia--sampul .salindia__judul {
    font-size: clamp(2.6rem, 9vh, 6rem);
  }

  .salindia--sampul .salindia__isi,
  .salindia--penutup .salindia__isi {
    color: var(--teks);
  }

  .salindia--bagian {
    border-left: 6px solid var(--aksen);
    padding-left: 3vw;
  }

  .salindia--keliru {
    border-left: 6px solid var(--salah);
    padding-left: 3vw;
  }

  .salindia--diuji {
    border-left: 6px solid var(--benar);
    padding-left: 3vw;
  }

  .salindia__gambar {
    margin-top: 2vh;
    max-height: 66vh;
    overflow: auto;
  }

  .rumus {
    list-style: none;
    margin: 2.4vh 0 0;
    padding: 0;
    display: grid;
    gap: 1.6vh;
  }

  .rumus li {
    display: grid;
    gap: 0.4vh;
  }

  .rumus__nama {
    font-size: clamp(0.85rem, 1.8vh, 1.15rem);
    color: var(--teks-3);
  }

  .rumus__ekspresi {
    font-family: var(--mono);
    font-size: clamp(1rem, 2.8vh, 2rem);
    color: var(--aksen);
    background: var(--latar-2);
    border: 1px solid var(--garis);
    border-radius: var(--r);
    padding: 0.6em 0.8em;
    display: block;
    overflow-x: auto;
  }

  .catatan-pengajar {
    position: absolute;
    left: 4vw;
    right: 4vw;
    bottom: 4.4rem;
    background: var(--latar-2);
    border: 1px solid var(--aksen);
    border-radius: var(--r);
    padding: 0.9rem 1.1rem;
    max-width: 70ch;
    box-shadow: 0 12px 40px -18px rgb(0 0 0 / 70%);
  }

  .catatan-pengajar h3 {
    margin: 0 0 0.3rem;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--aksen);
  }

  .catatan-pengajar p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--teks-2);
  }

  .deck__kaki {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.55rem 1rem;
    border-top: 1px solid var(--garis);
    background: var(--latar-2);
    flex-wrap: wrap;
  }

  .deck__kiri,
  .deck__kanan {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .deck__cacah {
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--teks-2);
    min-width: 5ch;
    text-align: center;
  }

  .tombol-kecil {
    font: inherit;
    font-size: 0.82rem;
    padding: 0.3rem 0.7rem;
    border-radius: 7px;
    border: 1px solid var(--garis-tegas);
    background: var(--latar-3);
    color: var(--teks);
    cursor: pointer;
  }

  .tombol-kecil:hover:not(:disabled) {
    border-color: var(--aksen);
  }

  .tombol-kecil:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .tombol-kecil[aria-pressed="true"] {
    background: var(--aksen-pudar);
    border-color: var(--aksen);
  }

  .lapis {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 55%);
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
  }

  .lapis__kotak {
    background: var(--latar-2);
    border: 1px solid var(--garis-tegas);
    border-radius: var(--r-besar);
    padding: 1.3rem 1.5rem;
    max-width: 640px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .lapis__kotak h3 {
    margin: 0 0 0.8rem;
    font-size: 1rem;
  }

  .daftar-sesi {
    list-style: none;
    margin: 0 0 1rem;
    padding: 0;
    display: grid;
    gap: 0.25rem;
  }

  .daftar-sesi button {
    width: 100%;
    text-align: left;
    font: inherit;
    font-size: 0.92rem;
    background: none;
    border: 0;
    border-radius: 7px;
    color: var(--teks);
    padding: 0.42rem 0.6rem;
    cursor: pointer;
    display: flex;
    gap: 0.7rem;
  }

  .daftar-sesi button:hover {
    background: var(--latar-3);
  }

  .daftar-sesi__nomor {
    font-family: var(--mono);
    color: var(--aksen);
  }

  .pintasan {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.35rem 1rem;
    margin: 0 0 1rem;
    font-size: 0.9rem;
  }

  .pintasan dt {
    font-family: var(--mono);
    color: var(--aksen);
  }

  .pintasan dd {
    margin: 0;
    color: var(--teks-2);
  }

  /* Perpindahan salindia yang beranimasi bisa memicu ketidaknyamanan, dan di
     depan kelas tidak ada yang bisa mematikannya sendiri. */
  @media (prefers-reduced-motion: reduce) {
    .deck__kemajuan {
      transition: none;
    }
  }
</style>
