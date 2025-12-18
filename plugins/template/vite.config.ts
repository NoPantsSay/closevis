import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    federation({
      filename: 'remoteEntry.js',
      name: 'template',
      exposes: {
        './app': './src/app.ts',
      },
      remotes: {},
      shared: {
        react: {
          requiredVersion: dependencies.react,
          singleton: true,
        },
        'react-dom': {
          requiredVersion: dependencies["react-dom"],
          singleton: true,
        }
      },
    }),
    react(), tsconfigPaths()],

  build: {
    rollupOptions: {
      input: {
        main: './src/app.ts' // 只提供 JS 入口
      }
    }
  }
});
