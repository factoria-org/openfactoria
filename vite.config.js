import { dirname, resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'url';
const filename = fileURLToPath(import.meta.url);
const d = dirname(filename);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        index: resolve(d, 'index.html'),
        config: resolve(d, 'config/index.html'),
        contract: resolve(d, 'contract/index.html'),
        files: resolve(d, 'files/index.html'),
        v1: resolve(d, 'v1/index.html'),
        v2: resolve(d, 'v2/index.html'),
        mint: resolve(d, 'mint/index.html'),
      }
    }
  },
  plugins: [svelte()]
})
