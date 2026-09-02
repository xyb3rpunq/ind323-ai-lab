import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

/**
 * Konfigurasi build.
 *
 * `base` disetel ke nama repositori karena situsnya terbit di GitHub Pages
 * pada sub-jalur. Melewatkannya membuat seluruh aset dicari di tempat yang
 * salah dan halamannya kosong tanpa pesan galat apa pun.
 *
 * .Deckyx
 */
export default defineConfig({
  plugins: [svelte()],
  base: "/ind323-ai-lab/",
  server: { port: 5175, strictPort: true },
  build: { target: "es2022", sourcemap: true },
});
