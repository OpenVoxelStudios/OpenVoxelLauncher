import { UserConfig, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

const root = resolve(__dirname);

var config: UserConfig = {
  root,
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'openvoxellauncher'),
    emptyOutDir: true,
  },
  publicDir: resolve(__dirname, 'src', 'assets')
};

export default defineConfig(config);