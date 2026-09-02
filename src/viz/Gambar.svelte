<!--
  Bingkai gambar: judul, isi, keterangan simbol, dan penjelasannya.

  `terang` wajib, dan bukan karena kerapian. Gambar tanpa penjelasan hanya
  berguna bagi yang sudah paham isinya, dan pembaca yang paling butuh gambar
  justru yang belum. Teks itu sekaligus menjadi label bagi pembaca layar, yang
  tidak bisa melihat gambarnya sama sekali — sebuah `<svg>` tanpa `aria-label`
  hanyalah lubang hening di tengah halaman.

  .Deckyx
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Kunci {
    warna: string;
    label: string;
    /** Garis putus-putus, untuk membedakan tanpa mengandalkan warna saja. */
    putus?: boolean;
  }

  interface Props {
    judul: string;
    terang: string;
    lebar: number;
    tinggi: number;
    kunci?: Kunci[];
    children: Snippet;
  }

  const { judul, terang, lebar, tinggi, kunci = [], children }: Props = $props();
</script>

<figure class="viz">
  <h3 class="viz__judul">{judul}</h3>
  <!--
    `viewBox` tanpa `width`/`height` tetap: gambarnya mengecil mengikuti lebar
    kolomnya alih-alih meluber keluar di layar sempit.
  -->
  <svg
    class="viz__svg"
    viewBox="0 0 {lebar} {tinggi}"
    role="img"
    aria-label="{judul}. {terang}"
  >
    {@render children()}
  </svg>

  {#if kunci.length > 0}
    <ul class="viz__kunci">
      {#each kunci as k (k.label)}
        <li>
          <span
            class="viz__contoh"
            class:viz__contoh--putus={k.putus}
            style="background: {k.putus ? 'transparent' : k.warna}; border-color: {k.warna}"
            aria-hidden="true"
          ></span>
          <span>{k.label}</span>
        </li>
      {/each}
    </ul>
  {/if}

  <figcaption class="viz__terang">{terang}</figcaption>
</figure>

<style>
  .viz {
    margin: 0 0 0.5rem;
  }

  .viz__judul {
    margin: 0 0 0.5rem;
    font-size: 0.78rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--teks-3);
    font-weight: 600;
  }

  .viz__svg {
    display: block;
    width: 100%;
    height: auto;
    max-width: 100%;
    background: var(--latar-3);
    border: 1px solid var(--garis);
    border-radius: var(--r);
  }

  .viz__kunci {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
    margin: 0.6rem 0 0;
    padding: 0;
    font-size: 0.85rem;
    color: var(--teks-2);
  }

  .viz__kunci li {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .viz__contoh {
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 3px;
    border: 1px solid var(--garis-tegas);
    flex: none;
  }

  /* Kunci untuk garis putus-putus digambar sebagai garis, bukan kotak penuh.
     Membedakan dua kurva hanya lewat warna gagal bagi sekitar satu dari dua
     puluh pembaca laki-laki. */
  .viz__contoh--putus {
    height: 0;
    border-width: 0 0 2px 0;
    border-style: dashed;
    border-radius: 0;
    align-self: center;
    width: 1.1rem;
  }

  .viz__terang {
    margin: 0.6rem 0 0;
    color: var(--teks-2);
    font-size: 0.88rem;
    line-height: 1.6;
    max-width: 76ch;
  }
</style>
