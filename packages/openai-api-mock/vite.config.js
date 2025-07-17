import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['nock', '@mswjs/interceptors'],
    },
    target: 'esnext',
    sourcemap: true,
  },
});