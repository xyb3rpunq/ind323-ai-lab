import { defineConfig } from "vitest/config";

/** Konfigurasi uji; tidak memuat plugin Svelte karena ujinya menguji logika,
 *  bukan komponen. Menambah plugin yang tidak dipakai hanya memperlambat. */
export default defineConfig({
  test: {
    include: ["uji-web/**/*.test.ts"],
    environment: "node",
  },
});
