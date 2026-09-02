import { defineConfig } from "vitest/config";

/** Konfigurasi uji; tidak memuat plugin Svelte karena ujinya menguji logika,
 *  bukan komponen. Menambah plugin yang tidak dipakai hanya memperlambat. */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
