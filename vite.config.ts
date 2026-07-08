import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GraphGiraffe',
      formats: ['es', 'cjs'],
      fileName: (format) => `graph-giraffe.${format === 'es' ? 'js' : 'cjs'}`,
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [],
    },
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
});
