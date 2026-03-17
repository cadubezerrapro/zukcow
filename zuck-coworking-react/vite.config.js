import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/conta/zuck-coworking/',
    build: {
        outDir: '../zuck-coworking',
        emptyOutDir: false,
        assetsDir: 'assets/build_v1',
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'phaser-vendor': ['phaser']
                },
                entryFileNames: 'assets/build_v1/[name]-cowork-v1-[hash].js',
                chunkFileNames: 'assets/build_v1/[name]-cowork-v1-[hash].js',
                assetFileNames: 'assets/build_v1/[name]-cowork-v1-[hash].[ext]'
            }
        }
    },
    server: {
        port: 5175,
        open: true
    }
});
