import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/fs.ts', 'src/cli.ts'],
  format: ['cjs', 'esm'],
  target: 'esnext',
  outDir: 'dist',
});
