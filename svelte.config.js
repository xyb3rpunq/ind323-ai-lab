import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** .Deckyx */
export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Runes dinyalakan tegas, bukan disimpulkan per berkas. Menyimpulkannya
    // membuat dua berkas bisa memakai model reaktivitas yang berbeda tanpa
    // terlihat, dan perbedaan itu baru muncul sebagai bug yang membingungkan.
    runes: true,
  },
};
